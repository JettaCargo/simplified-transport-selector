import { IncomingMessage, ServerResponse } from 'http'
import { handle_transports_selection } from './handle_transports_selection'
import { send_json } from './send_json'
import { error_response_from_unknown } from './error_response_from_unknown'

const HEALTH_BODY = 'MS of Transport Selector JettaCargo '

/**
 * Routes health checks and transport selection.
 * @param request request
 * @param response response
 */
export async function route(request: IncomingMessage, response: ServerResponse): Promise<void>
{
    const url = request.url || ''
    if (request.method === 'GET' && is_health(url))
    {
        write_health(response)
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
 * @returns whether the url is a health check
 */
function is_health(url: string): boolean
{
    return url === '/' || url === '/livez' || url === '/readyz'
}

/**
 * @param url request url
 * @returns whether the url selects transports
 */
function is_selection(url: string): boolean
{
    return url === '/' || url === '/transports_selection'
}

/**
 * @param response response
 */
function write_health(response: ServerResponse): void
{
    response.writeHead(200, { 'Content-Type': 'text/plain', Connection: 'close' })
    response.end(HEALTH_BODY)
}

export { send_json, error_response_from_unknown }
