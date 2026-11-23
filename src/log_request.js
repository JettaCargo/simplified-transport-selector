/**
 * Builds the shared stdout prefix for a selection request.
 * @param {object} payload parsed JSON body
 * @returns {string}
 */
function selection_log_prefix(payload)
{
    const trace_id = payload && payload.trace_id ? payload.trace_id : 'no-trace'
    return `${new Date().toISOString()} (${trace_id})-[INFO]-`
}

/**
 * @param {object} payload parsed JSON body
 * @returns {string}
 */
function selection_log_header(payload)
{
    return payload && payload.log_header ? payload.log_header : ''
}

/**
 * Logs one transport-selection request so a trace can be matched in pod logs.
 * @param {object} payload parsed JSON body
 * @returns {void}
 */
function log_transport_selection_request(payload)
{
    const collect_count = Array.isArray(payload && payload.collects) ? payload.collects.length : 0
    const vehicle_count = Array.isArray(payload && payload.vehicles) ? payload.vehicles.length : 0
    const summary = JSON.stringify({
        log_header: selection_log_header(payload),
        collect_count,
        vehicle_count,
    })
    console.log(`${selection_log_prefix(payload)}|Transport Selection Request| => ${summary}`)
}

/**
 * Logs the selector return: slot count on success, apiError on failure.
 * @param {object} payload parsed JSON body
 * @param {object} result selector response
 * @returns {void}
 */
function log_transport_selection_response(payload, result)
{
    const vehicle_slot_count = Array.isArray(result && result.vehicles_array)
        ? result.vehicles_array.length
        : 0
    const api_error = result && result.apiError ? result.apiError : ''
    const summary = JSON.stringify({
        log_header: selection_log_header(payload),
        vehicle_slot_count,
        api_error,
    })
    console.log(`${selection_log_prefix(payload)}|Transport Selection Response| => ${summary}`)
}

module.exports = { log_transport_selection_request, log_transport_selection_response }
