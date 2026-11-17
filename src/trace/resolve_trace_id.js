/**
 * Reads the request trace id from the selector payload.
 * @param {object} payload raw or partial request body
 * @returns {string|null} trace id or null when absent
 */
function resolve_trace_id(payload)
{
    const trace_id = payload && payload.trace_id
    if (trace_id === undefined || trace_id === null)
        return null
    const text = String(trace_id).trim()
    return text.length > 0 ? text : null
}

module.exports = { resolve_trace_id }
