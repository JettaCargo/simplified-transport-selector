import { z } from 'zod'

const model_size_environment_schema = z.object({
    MAX_ASSIGNMENT_COLUMNS: z.coerce.number().int().min(1).default(50000),
    MAX_MODEL_ROWS: z.coerce.number().int().min(1).default(200000),
})

/**
 * Largest MILP the selector agrees to build and solve.
 */
export interface Model_Size_Limits
{
    max_assignment_columns: number
    max_model_rows: number
}

/**
 * Reads and validates the model size limits.
 * @param environment process environment
 * @returns validated limits
 */
export function read_model_size_limits(environment: Record<string, string | undefined>): Model_Size_Limits
{
    const parsed = model_size_environment_schema.parse(environment)
    return {
        max_assignment_columns: parsed.MAX_ASSIGNMENT_COLUMNS,
        max_model_rows: parsed.MAX_MODEL_ROWS,
    }
}
