import { IncomingMessage, ServerResponse } from 'http'
import { select_transports } from '../core/selection/select_transports'
import { error_response_from_unknown } from './error_response_from_unknown'
import { parse_json_body } from './parse_json_body'
import { read_body } from './read_body'
import { send_json } from './send_json'

/**
 * Handles POST / and POST /transports_selection.
 * @param request request
 * @param response response
 */
export async function handle_transports_selection(request: IncomingMessage, response: ServerResponse): Promise<void>
{
    try
    {
        const payload = parse_json_body(await read_body(request))
        send_json(response, 200, await select_transports(payload))
    }
    catch (error)
    {
        send_json(response, 200, error_response_from_unknown(error))
    }
}
