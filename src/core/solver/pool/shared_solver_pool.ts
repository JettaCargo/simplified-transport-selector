import path from 'path'
import { SolverPool } from './Solver_Pool'
import { read_solver_pool_config } from './solver_pool_config'

const WORKER_PATH = path.join(__dirname, 'solver_worker.js')

let shared_pool: SolverPool | undefined

/**
 * @returns the process-wide solver pool, started on first use
 */
export function shared_solver_pool(): SolverPool
{
    shared_pool = shared_pool || new SolverPool(read_solver_pool_config(process.env), WORKER_PATH)
    return shared_pool
}

/**
 * Replaces the process-wide pool, e.g. to embed the selector with custom workers.
 * The caller owns closing the previous pool.
 * @param pool pool to use from now on
 */
export function use_shared_solver_pool(pool: SolverPool): void
{
    shared_pool = pool
}

/**
 * Stops the process-wide pool if it was started.
 * @returns when every worker has stopped
 */
export async function close_shared_solver_pool(): Promise<void>
{
    const pool = shared_pool
    shared_pool = undefined
    await pool?.close()
}
