import { ServerResponse } from 'http'

/**
 * Writes a JSON HTTP response and closes the connection.
 * @param response response
 * @param status status code
 * @param body body
 */
export function send_json(response: ServerResponse, status: number, body: object | string): void
{
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(text),
        Connection: 'close',
    })
    response.end(text)
}
