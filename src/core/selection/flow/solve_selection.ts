import { error_response } from '../../messages/envelope/error_response'
import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { Selector_Request } from '../../input/request/selector_request'
import { Packing_Cut } from '../../solver/constraints/packing_cut'
import { read_solver_pool_config } from '../../solver/pool/solver_pool_config'
import { Selector_Success } from '../response/format_response'
import { read_packing_retry_limit } from './packing_retry_limit'
import { Selection_Options } from './selection_options'
import { solve_round } from './solve_round'

/**
 * Solves the type-level MILP and packs the chosen fleet. When first-fit cannot
 * pack an assignment, that assignment is forbidden and the model is re-solved,
 * up to PACKING_RETRY_LIMIT extra rounds within one solver time budget.
 * @param request parsed request with expanded groups
 * @param options abort signal of the caller
 * @returns success body or error envelope
 */
export async function solve_selection(request: Selector_Request, options: Selection_Options = {}): Promise<Selector_Success | Error_Envelope>
{
    const time_budget_seconds = read_solver_pool_config(process.env).time_limit_seconds
    const started = Date.now()
    const packing_cuts: Packing_Cut[] = []
    const rounds = read_packing_retry_limit(process.env) + 1
    for (let round = 0; round < rounds; round++)
    {
        const time_limit_seconds = time_budget_seconds - (Date.now() - started) / 1000
        const outcome = await solve_round(request, { ...options, packing_cuts, time_limit_seconds })
        if ('response' in outcome)
        {
            return outcome.response
        }
        packing_cuts.push(outcome.packing_cut)
        options.metrics?.record_packing_retries(packing_cuts.length)
    }
    return error_response(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED)
}
