import { z } from 'zod'
import { read_number } from './read_number'

/**
 * Accepts a number or a numeric string, then applies the number schema.
 * @param schema number schema, including int, optional, and default
 * @returns preprocessed schema
 */
export function number_schema(schema: z.ZodType)
{
    return z.preprocess(read_number, schema)
}
