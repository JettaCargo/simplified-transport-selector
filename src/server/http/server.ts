import http from 'http'
import { Logger } from '@jetta/logger'
import { shared_solver_pool } from '../../core/solver/pool/shared_solver_pool'
import { start_scaler_http_heartbeat } from '../../heartbeat/runner/start_scaler_http_heartbeat'
import { error_response_from_unknown } from '../errors/error_response_from_unknown'
import { shared_service_readiness } from '../health/shared_service_readiness'
import { graceful_shutdown } from '../shutdown/graceful_shutdown'
import { install_process_error_handlers } from '../shutdown/install_process_error_handlers'
import { read_shutdown_grace_milliseconds } from '../shutdown/shutdown_config'
import { route } from './route'
import { send_json } from './send_json'
import { read_server_config } from './server_config'

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
const server_config = read_server_config(process.env)
server.requestTimeout = server_config.request_timeout_milliseconds
server.headersTimeout = server_config.headers_timeout_milliseconds

if (require.main === module)
{
    listen()
}

/**
 * Starts the solver pool, the heartbeat, and the listener, and drains on SIGTERM.
 */
function listen(): void
{
    install_process_error_handlers(process, logger)
    const pool = shared_solver_pool()
    const heartbeat = start_scaler_http_heartbeat()
    const grace_milliseconds = read_shutdown_grace_milliseconds(process.env)
    process.once('SIGTERM', () => void shut_down({ server, readiness: shared_service_readiness, pool, heartbeat, grace_milliseconds }))
    server.listen(PORT, HOST, () =>
    {
        logger.log(`transport-selector listening on ${HOST}:${PORT}`)
    })
}

/**
 * @param dependencies what graceful shutdown stops
 */
async function shut_down(dependencies: Parameters<typeof graceful_shutdown>[0]): Promise<void>
{
    logger.log('SIGTERM received, draining in-flight transport selections')
    const drained = await graceful_shutdown(dependencies)
    logger.log(drained ? 'drained, exiting' : 'grace period elapsed with solves still running, exiting')
    process.exit(0)
}
