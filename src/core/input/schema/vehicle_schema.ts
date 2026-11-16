import { z } from 'zod'
import { container_schema } from './container_schema'
import { number_schema } from './number/number_schema'

/**
 * Vehicle object. Unlimited defaults to true when the flag is omitted.
 */
export const vehicle_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    supported_weight: number_schema(z.number()),
    amount: number_schema(z.number().int()),
    unlimited: z.boolean().default(true),
    cost: number_schema(z.number().default(0)),
    containers: z.array(container_schema).optional(),
    width: number_schema(z.number().optional()),
    length: number_schema(z.number().optional()),
    height: number_schema(z.number().optional()),
    sequencia: number_schema(z.number().int().optional()),
})
