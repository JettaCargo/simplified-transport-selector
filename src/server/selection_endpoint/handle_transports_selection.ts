import { IncomingMessage, ServerResponse } from 'http'
import { SelectionMetrics } from '../../core/selection/metrics/Selection_Metrics'
import { select_transports } from '../../core/selection/flow/select_transports'
import { error_response_from_unknown } from '../errors/error_response_from_unknown'
import { parse_json_body } from '../body/parse_json_body'
import { read_body } from '../body/read_body'
import { read_server_config } from '../http/server_config'
import { send_json } from '../http/send_json'
import { log_selection_outcome, Selection_Outcome } from '../logging/log_selection_outcome'
import { abort_on_disconnect } from './abort_on_disconnect'

/**
 * Handles POST / and POST /transports_selection.
 * A client that disconnects cancels its own solve and frees its worker.
 * Every request ends with one outcome log line.
 * @param request request
 * @param response response
 */
export async function handle_transports_selection(request: IncomingMessage, response: ServerResponse): Promise<void>
{
    const signal = abort_on_disconnect(response)
    const metrics = new SelectionMetrics()
    const started_at = Date.now()
    try
    {
        const body = await read_body(request, read_server_config(process.env).max_body_bytes)
        finish(response, metrics, { body: await select_transports(parse_json_body(body), { signal, metrics }), started_at })
    }
    catch (error)
    {
        finish(response, metrics, { body: error_response_from_unknown(error), error, started_at })
    }
}

/**
 * @param response response
 * @param metrics per-request facts
 * @param outcome response body, thrown error, and start time
 */
function finish(response: ServerResponse, metrics: SelectionMetrics, outcome: Selection_Outcome): void
{
    log_selection_outcome(metrics, outcome)
    if (response.destroyed || response.writableEnded)
    {
        return
    }
    send_json(response, 200, outcome.body)
}
