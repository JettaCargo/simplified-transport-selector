import { ServerResponse } from 'http'
import { shared_solver_pool } from '../../core/solver/pool/shared_solver_pool'
import { shared_service_readiness } from './shared_service_readiness'

const HEALTH_BODY = 'MS of Transport Selector JettaCargo '
const NOT_READY_BODY = 'not ready'
const READINESS_PATH = '/readyz'
const HEALTH_PATHS = new Set(['/', '/livez', READINESS_PATH])

/**
 * @param url request url
 * @returns whether the url is a health probe
 */
export function is_health_path(url: string): boolean
{
    return HEALTH_PATHS.has(url)
}

/**
 * Liveness (`/`, `/livez`) only proves the event loop answers. Readiness
 * (`/readyz`) is 503 while shutting down or while the solver pool cannot
 * take another job, so the load balancer sends traffic elsewhere.
 * @param url health path
 * @param response response
 */
export function write_health(url: string, response: ServerResponse): void
{
    const ready = url !== READINESS_PATH || is_ready()
    response.writeHead(ready ? 200 : 503, { 'Content-Type': 'text/plain', Connection: 'close' })
    response.end(ready ? HEALTH_BODY : NOT_READY_BODY)
}

/**
 * @returns whether the service accepts new selection work
 */
function is_ready(): boolean
{
    return !shared_service_readiness.is_shutting_down() && !shared_solver_pool().is_saturated()
}
