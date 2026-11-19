/**
 * Reads the request trace id from the selector payload or parsed request.
 * @param source object that may carry trace_id
 * @returns trace id or null when absent
 */
export function resolve_trace_id(source: { trace_id?: string | null } | null | undefined): string | null
{
    const trace_id = source && source.trace_id
    if (trace_id === undefined || trace_id === null)
    {
        return null
    }
    const text = String(trace_id).trim()
    return text.length > 0 ? text : null
}
