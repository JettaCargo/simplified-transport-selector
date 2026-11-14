import { error_response } from '../../messages/envelope/error_response'
import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { Selector_Request } from '../../input/request/selector_request'
import { Packing_Cut } from '../../solver/constraints/packing_cut'
import { read_solution, Solver_Solution } from '../../solver/highs/read_solution'
import { solve_lp } from '../../solver/highs/solve_lp'
import { build_chosen_fleet } from '../fleet/build_chosen_fleet'
import { unpackable_assignment } from '../fleet/unpackable_assignment'
import { format_response, Selector_Success } from '../response/format_response'
import { build_model } from './build_model'
import { Selection_Options } from './selection_options'
import { unusable_solver_result } from './unusable_solver_result'

/**
 * Inputs of one solve round.
 */
export interface Solve_Round_Input extends Selection_Options
{
    packing_cuts: Packing_Cut[]
    time_limit_seconds: number
}

/**
 * Final response of the round, or the assignment the next round must forbid.
 */
export type Solve_Round_Outcome = { response: Selector_Success | Error_Envelope } | { packing_cut: Packing_Cut }

/**
 * Builds, solves, and packs once.
 * @param request parsed request with expanded groups
 * @param input earlier cuts, remaining time, and abort signal
 * @returns response or the next packing cut
 */
export async function solve_round(request: Selector_Request, input: Solve_Round_Input): Promise<Solve_Round_Outcome>
{
    const model = build_model(request, input.packing_cuts)
    if ('apiError' in model)
    {
        return { response: model }
    }
    if (input.time_limit_seconds <= 0)
    {
        return { response: error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT) }
    }
    const result = await solve_lp(model.lp, { signal: input.signal, time_limit_seconds: input.time_limit_seconds, on_timing: input.metrics?.record_timing })
    input.metrics?.record_solve({ solver_status: result.Status, assignment_columns: request.groups.length * request.vehicles.length })
    const unusable = unusable_solver_result(result)
    if (unusable)
    {
        return { response: unusable }
    }
    return pack_solution(request, read_solution(result, request.groups, request.vehicles))
}

/**
 * @param request parsed request
 * @param solution usable solver output
 * @returns packed response, or the assignment to forbid next round
 */
function pack_solution(request: Selector_Request, solution: Solver_Solution): Solve_Round_Outcome
{
    const chosen = build_chosen_fleet(request, solution)
    if (chosen)
    {
        return { response: format_response(chosen) }
    }
    const packing_cut = unpackable_assignment(request, solution)
    return packing_cut ? { packing_cut } : { response: error_response(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED) }
}
