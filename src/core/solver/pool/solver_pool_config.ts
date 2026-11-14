import { z } from 'zod'

const solver_pool_environment_schema = z.object({
    SOLVER_POOL_SIZE: z.coerce.number().int().min(1).default(2),
    SOLVER_QUEUE_LIMIT: z.coerce.number().int().min(0).default(4),
    SOLVER_TIME_LIMIT_SECONDS: z.coerce.number().positive().default(60),
    SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS: z.coerce.number().int().min(0).default(5000),
    SOLVER_WORKER_MAX_OLD_GENERATION_MB: z.coerce.number().int().min(16).default(256),
})

/**
 * Settings of the isolated solver pool.
 */
export interface Solver_Pool_Config
{
    pool_size: number
    queue_limit: number
    time_limit_seconds: number
    hard_timeout_grace_milliseconds: number
    worker_max_old_generation_mb: number
}

/**
 * Reads and validates the solver pool settings.
 * @param environment process environment
 * @returns validated settings
 */
export function read_solver_pool_config(environment: Record<string, string | undefined>): Solver_Pool_Config
{
    const parsed = solver_pool_environment_schema.parse(environment)
    return {
        pool_size: parsed.SOLVER_POOL_SIZE,
        queue_limit: parsed.SOLVER_QUEUE_LIMIT,
        time_limit_seconds: parsed.SOLVER_TIME_LIMIT_SECONDS,
        hard_timeout_grace_milliseconds: parsed.SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS,
        worker_max_old_generation_mb: parsed.SOLVER_WORKER_MAX_OLD_GENERATION_MB,
    }
}
