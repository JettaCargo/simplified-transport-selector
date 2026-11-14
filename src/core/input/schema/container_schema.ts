import { z } from 'zod'

/**
 * Container object required by JSONFactory.
 */
export const container_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    supported_weight: z.number(),
    width: z.number(),
    length: z.number(),
    height: z.number(),
    sequencia: z.number().int().default(1),
})
