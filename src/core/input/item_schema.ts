import { z } from 'zod'
import { ROTATION_VALUES } from './selector_input_vocabulary'
import { read_priority } from './read_priority'

/**
 * Item object accepted by the Java selector, plus optional volume.
 */
export const item_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    weight: z.number(),
    amount: z.number().int(),
    width: z.number(),
    length: z.number(),
    height: z.number(),
    current_rotation: z.enum(ROTATION_VALUES),
    rotations: z.array(z.enum(ROTATION_VALUES)),
    supported_weight: z.number().default(0),
    priority: z.preprocess(read_priority, z.boolean()),
    type: z.string().default(''),
    unlimited: z.boolean().default(false),
    volume: z.number().optional(),
})
