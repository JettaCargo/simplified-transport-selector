import { z } from 'zod'
import { number_schema } from './number/number_schema'

/**
 * Container object required by JSONFactory.
 */
export const container_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    supported_weight: number_schema(z.number()),
    width: number_schema(z.number()),
    length: number_schema(z.number()),
    height: number_schema(z.number()),
    sequencia: number_schema(z.number().int().default(1)),
})
