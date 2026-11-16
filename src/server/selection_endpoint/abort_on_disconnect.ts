import { ServerResponse } from 'http'

/**
 * Aborts when the client disconnects before the response is fully written.
 * @param response response
 * @returns signal that fires on disconnect
 */
export function abort_on_disconnect(response: ServerResponse): AbortSignal
{
    const controller = new AbortController()
    response.on('close', () =>
    {
        if (!response.writableFinished)
        {
            controller.abort()
        }
    })
    return controller.signal
}
