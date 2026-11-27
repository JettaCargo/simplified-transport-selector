import { z } from 'zod'
import { item_schema } from './item_schema'

/**
 * Collect object. restrictedToVehicles is required, even when empty.
 */
export const collect_schema = z.looseObject({
    id: z.string(),
    restrictedToVehicles: z.array(z.string()),
    items: z.array(item_schema).default([]),
})
