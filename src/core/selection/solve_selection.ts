import { error_response } from '../messages/error_response'
import { TRANSPORT_SELECTOR_MESSAGE } from '../messages/transport_selector_message'
import { read_solution } from '../solver/read_solution'
import { solve_lp } from '../solver/solve_lp'
import { Error_Envelope } from '../types/error_envelope'
import { Selector_Request } from '../types/selector_request'
import { build_chosen_fleet } from './build_chosen_fleet'
import { build_model } from './build_model'
import { format_response, Selector_Success } from './format_response'

/**
 * Solves the type-level MILP and packs the chosen fleet.
 * @param request parsed request with expanded groups
 * @returns success body or error envelope
 */
export async function solve_selection(request: Selector_Request): Promise<Selector_Success | Error_Envelope>
{
    const model = build_model(request)
    if ('apiError' in model)
    {
        return model
    }
    const result = await solve_lp(model.lp)
    if (!solver_succeeded(result.Status))
    {
        return error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS, [String(result.Status)])
    }
    const chosen = build_chosen_fleet(request, read_solution(result, request.groups, request.vehicles))
    if (!chosen)
    {
        return error_response(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED)
    }
    return format_response(chosen)
}

/**
 * @param status HiGHS status
 * @returns whether the status is an accepted optimum
 */
function solver_succeeded(status: string): boolean
{
    return status === 'Optimal' || status === 'OptimalInfeas'
}
