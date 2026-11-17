import { Selector_Request } from '../input/request/selector_request'
import { Selection_Options } from '../selection/flow/selection_options'
import { resolve_trace_id } from './resolve_trace_id'
import { Tracer_Library } from './tracer_library'

/**
 * Resolved tracing ids for one selection request.
 */
export interface Selection_Tracing
{
    trace_id: string
    base_id: string | undefined
    tracer_library: Tracer_Library | undefined
}

/**
 * Builds tracing ids from the parsed request when trace_id is present.
 * @param request parsed request
 * @param options selection options
 * @returns tracing context or null
 */
export function selection_tracing_for(
    request: Selector_Request,
    options: Selection_Options = {},
): Selection_Tracing | null
{
    const trace_id = resolve_trace_id(request)
    if (!trace_id)
    {
        return null
    }
    return {
        trace_id,
        base_id: request.log_header || undefined,
        tracer_library: options.tracer_library,
    }
}
