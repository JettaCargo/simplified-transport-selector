/**
 * Logs one transport-selection request so a trace can be matched in pod logs.
 * @param {object} payload parsed JSON body
 * @returns {void}
 */
function log_transport_selection_request(payload)
{
    const trace_id = payload && payload.trace_id ? payload.trace_id : 'no-trace'
    const log_header = payload && payload.log_header ? payload.log_header : ''
    const collect_count = Array.isArray(payload && payload.collects) ? payload.collects.length : 0
    const vehicle_count = Array.isArray(payload && payload.vehicles) ? payload.vehicles.length : 0
    const summary = JSON.stringify({
        log_header,
        collect_count,
        vehicle_count,
    })
    console.log(`${new Date().toISOString()} (${trace_id})-[INFO]-|Transport Selection Request| => ${summary}`)
}

module.exports = { log_transport_selection_request }
