import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { Selector_Request } from '../../input/request/selector_request'
import { Aggregated_Model } from '../../solver/model/aggregated_model'
import { Highs_Result } from '../../solver/highs/highs_result'
import { read_solution, Solver_Solution } from '../../solver/highs/read_solution'
import { solve_lp } from '../../solver/highs/solve_lp'
import { Selection_Tracing } from '../../trace/selection_tracing'
import { trace_highs_solve } from '../../trace/trace_highs_solve'
import { with_manual_transaction } from '../../trace/with_manual_transaction'
import { build_model } from './build_model'
import { Solve_Round_Input, Solve_Round_Outcome } from './solve_round_types'

/**
 * Shared inputs for traced helpers of one solve round.
 */
export interface Round_Trace_Context
{
    request: Selector_Request
    input: Solve_Round_Input
    tracing: Selection_Tracing | null
}

/**
 * @param context round context
 * @returns model or error
 */
export async function traced_build_model(
    context: Round_Trace_Context,
): Promise<Aggregated_Model | Error_Envelope>
{
    const run = () => build_model(context.request, context.input.packing_cuts)
    if (!context.tracing)
    {
        return run()
    }
    return with_manual_transaction({
        trace_id: context.tracing.trace_id,
        base_id: context.tracing.base_id,
        tracer_library: context.tracing.tracer_library,
        context: 'build-aggregated-model',
        async_fn: async () => run(),
    })
}

/**
 * @param context round context
 * @param model_text LP text
 * @returns HiGHS result
 */
export async function traced_solve_lp(
    context: Round_Trace_Context,
    model_text: string,
): Promise<Highs_Result>
{
    const solve_options = {
        signal: context.input.signal,
        time_limit_seconds: context.input.time_limit_seconds,
        on_timing: context.input.metrics?.record_timing,
    }
    if (!context.tracing)
    {
        return solve_lp(model_text, solve_options)
    }
    return trace_highs_solve({
        ...solve_options,
        model_text,
        trace_id: context.tracing.trace_id,
        base_id: context.tracing.base_id,
        tracer_library: context.tracing.tracer_library,
    })
}

/**
 * @param context round context
 * @param solution usable solver output
 * @param pack_solution pack callback
 * @returns pack outcome
 */
export async function traced_pack_solution(
    context: Round_Trace_Context,
    solution: Solver_Solution,
    pack_solution: (request: Selector_Request, solution: Solver_Solution) => Solve_Round_Outcome,
): Promise<Solve_Round_Outcome>
{
    if (!context.tracing)
    {
        return pack_solution(context.request, solution)
    }
    return with_manual_transaction({
        trace_id: context.tracing.trace_id,
        base_id: context.tracing.base_id,
        tracer_library: context.tracing.tracer_library,
        context: 'pack-fleet',
        async_fn: async () => pack_solution(context.request, solution),
    })
}

/**
 * @param context round context
 * @param result HiGHS result
 * @returns solution maps
 */
export function read_round_solution(context: Round_Trace_Context, result: Highs_Result): Solver_Solution
{
    return read_solution(result, context.request.groups, context.request.vehicles)
}
