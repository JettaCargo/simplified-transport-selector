import { error_response } from '../../messages/envelope/error_response'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { Selector_Request } from '../../input/request/selector_request'
import { Aggregated_Model } from '../../solver/model/aggregated_model'
import { Solver_Solution } from '../../solver/highs/read_solution'
import { Highs_Result } from '../../solver/highs/highs_result'
import { selection_tracing_for } from '../../trace/selection_tracing'
import { build_chosen_fleet } from '../fleet/build_chosen_fleet'
import { unpackable_assignment } from '../fleet/unpackable_assignment'
import { format_response } from '../response/format_response'
import {
    read_round_solution,
    Round_Trace_Context,
    traced_build_model,
    traced_pack_solution,
    traced_solve_lp,
} from './solve_round_trace'
import { Solve_Round_Input, Solve_Round_Outcome } from './solve_round_types'
import { unusable_solver_result } from './unusable_solver_result'

export type { Solve_Round_Input, Solve_Round_Outcome } from './solve_round_types'

/**
 * Builds, solves, and packs once.
 * @param request parsed request with expanded groups
 * @param input earlier cuts, remaining time, and abort signal
 * @returns response or the next packing cut
 */
export async function solve_round(request: Selector_Request, input: Solve_Round_Input): Promise<Solve_Round_Outcome>
{
    const context: Round_Trace_Context = {
        request,
        input,
        tracing: selection_tracing_for(request, input),
    }
    const model = await traced_build_model(context)
    if ('apiError' in model)
    {
        return { response: model }
    }
    if (input.time_limit_seconds <= 0)
    {
        return { response: error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT) }
    }
    return finish_solve_round(context, model)
}

/**
 * @param context round context
 * @param model built LP
 * @returns round outcome
 */
async function finish_solve_round(
    context: Round_Trace_Context,
    model: Aggregated_Model,
): Promise<Solve_Round_Outcome>
{
    const result = await traced_solve_lp(context, model.lp)
    record_round_solve(context, result)
    const unusable = unusable_solver_result(result)
    if (unusable)
    {
        return { response: unusable }
    }
    return traced_pack_solution(context, read_round_solution(context, result), pack_solution)
}

/**
 * @param context round context
 * @param result HiGHS result
 */
function record_round_solve(context: Round_Trace_Context, result: Highs_Result): void
{
    context.input.metrics?.record_solve({
        solver_status: result.Status,
        assignment_columns: context.request.groups.length * context.request.vehicles.length,
    })
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
    return packing_cut
        ? { packing_cut }
        : { response: error_response(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED) }
}
