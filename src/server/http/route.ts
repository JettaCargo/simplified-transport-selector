import { IncomingMessage, ServerResponse } from 'http'
import { handle_transports_selection } from '../selection_endpoint/handle_transports_selection'
import { is_health_path, write_health } from '../health/write_health'
import { send_json } from './send_json'
import { error_response_from_unknown } from '../errors/error_response_from_unknown'

/**
 * Routes health checks and transport selection.
 * @param request request
 * @param response response
 */
export async function route(request: IncomingMessage, response: ServerResponse): Promise<void>
{
    const url = request.url || ''
    if (request.method === 'GET' && is_health_path(url))
    {
        write_health(url, response)
        return
    }
    if (request.method === 'POST' && is_selection(url))
    {
        await handle_transports_selection(request, response)
        return
    }
    response.writeHead(404, { Connection: 'close' })
    response.end('not found')
}

/**
 * @param url request url
 * @returns whether the url selects transports
 */
function is_selection(url: string): boolean
{
    return url === '/' || url === '/transports_selection'
}

export { send_json, error_response_from_unknown }
