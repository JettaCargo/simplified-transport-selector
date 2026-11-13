import http from 'http'
import { Logger } from '@jetta/logger'
import { error_response_from_unknown } from './error_response_from_unknown'
import { route } from './route'
import { send_json } from './send_json'

const PORT = Number(process.env.PORT || 8085)
const HOST = process.env.HOST || '0.0.0.0'
const logger = Logger.system_logger('transport-selector')

/**
 * HTTP server for transport selection.
 */
export const server = http.createServer((request, response) =>
{
    route(request, response).catch(error =>
    {
        send_json(response, 500, error_response_from_unknown(error))
    })
})

if (require.main === module)
{
    listen()
}

/**
 * Starts the HTTP listener.
 */
function listen(): void
{
    server.listen(PORT, HOST, () =>
    {
        logger.log(`transport-selector listening on ${HOST}:${PORT}`)
    })
}
