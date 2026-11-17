import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { selection_tracing_for } from '../../trace/selection_tracing'
import { with_manual_transaction } from '../../trace/with_manual_transaction'
import { append_single_limited_transport } from '../single_limited/append_single_limited_transport'
import { parse_request } from '../../input/request/parse_request'
import { SELECTION_PATH } from '../metrics/selection_path'
import { prepare_groups } from './prepare_groups'
import { Selector_Success } from '../response/format_response'
import { Selection_Options } from './selection_options'
import { solve_selection } from './solve_selection'

/**
 * Selects transports with a type-level MILP plus bin packing.
 * A single limited vehicle with stock 1 skips the solver and takes every collect.
 * @param payload Java selector request body
 * @param options abort signal and metrics recorder of the caller
 * @returns vehicles_array response or error payload
 */
export async function select_transports(
    payload: unknown,
    options: Selection_Options = {},
): Promise<Selector_Success | Error_Envelope>
{
    const request = parse_request(payload)
    const tracing = selection_tracing_for(request, options)
    if (!tracing)
    {
        return run_selection(request, options)
    }
    return with_manual_transaction({
        trace_id: tracing.trace_id,
        base_id: tracing.base_id,
        tracer_library: tracing.tracer_library,
        context: 'transport-selection',
        to: 'simplified-transport-selector',
        async_fn: () => run_selection(request, options),
    })
}

/**
 * @param request parsed request
 * @param options selection options
 * @returns success or error envelope
 */
async function run_selection(
    request: ReturnType<typeof parse_request>,
    options: Selection_Options,
): Promise<Selector_Success | Error_Envelope>
{
    options.metrics?.describe_request(request)
    const appended = append_single_limited_transport(request)
    if (appended)
    {
        options.metrics?.record_path(SELECTION_PATH.SINGLE_LIMITED)
        return appended
    }
    const prepared = prepare_groups(request)
    if ('apiError' in prepared)
    {
        return prepared
    }
    options.metrics?.record_path(SELECTION_PATH.SOLVER)
    return solve_selection(prepared, options)
}
