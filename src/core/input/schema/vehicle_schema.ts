import { z } from 'zod'
import { container_schema } from './container_schema'

/**
 * Vehicle object. Unlimited defaults to true when the flag is omitted.
 */
export const vehicle_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    supported_weight: z.number(),
    amount: z.number().int(),
    unlimited: z.boolean().default(true),
    cost: z.number().default(0),
    containers: z.array(container_schema).optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(),
    sequencia: z.number().int().optional(),
})
