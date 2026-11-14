import { Server } from 'http'
import { ServiceReadiness } from '../health/Service_Readiness'

/**
 * What graceful shutdown stops, in order.
 */
export interface Shutdown_Dependencies
{
    server: Server
    readiness: ServiceReadiness
    pool: { drain: (timeout_milliseconds: number) => Promise<boolean>, close: () => Promise<void> }
    heartbeat: { stop: () => Promise<void> }
    grace_milliseconds: number
}

/**
 * Stops taking traffic, lets in-flight solves finish within the grace period,
 * then stops the solver pool, the server, and the heartbeat.
 * Solves still running after the grace period are failed with the busy key.
 * @param dependencies server, readiness, pool, heartbeat, and grace period
 * @returns whether every in-flight solve finished within the grace period
 */
export async function graceful_shutdown(dependencies: Shutdown_Dependencies): Promise<boolean>
{
    dependencies.readiness.begin_shutdown()
    const server_closed = close_server(dependencies.server)
    const drained = await dependencies.pool.drain(dependencies.grace_milliseconds)
    await dependencies.pool.close()
    await server_closed
    await dependencies.heartbeat.stop()
    return drained
}

/**
 * @param server server
 * @returns resolves once open connections ended
 */
function close_server(server: Server): Promise<void>
{
    return new Promise(resolve => server.close(() => resolve()))
}
