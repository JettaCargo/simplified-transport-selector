import { z } from 'zod'

const packing_retry_schema = z.object({
    PACKING_RETRY_LIMIT: z.coerce.number().int().min(0).default(3),
})

/**
 * How many extra solve rounds may forbid an unpackable assignment.
 * @param environment process environment
 * @returns retry limit
 */
export function read_packing_retry_limit(environment: Record<string, string | undefined>): number
{
    return packing_retry_schema.parse(environment).PACKING_RETRY_LIMIT
}
