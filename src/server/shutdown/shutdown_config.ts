import { z } from 'zod'

const shutdown_environment_schema = z.object({
    SHUTDOWN_GRACE_MILLISECONDS: z.coerce.number().int().min(0).default(65000),
})

/**
 * How long SIGTERM waits for in-flight solves.
 * @param environment process environment
 * @returns grace period in milliseconds
 */
export function read_shutdown_grace_milliseconds(environment: Record<string, string | undefined>): number
{
    return shutdown_environment_schema.parse(environment).SHUTDOWN_GRACE_MILLISECONDS
}
