import { z } from 'zod'
import { ROTATION_VALUES } from './selector_input_vocabulary'
import { number_schema } from './number/number_schema'
import { read_priority } from '../request/read_priority'

/**
 * Item object accepted by the Java selector, plus optional volume.
 */
export const item_schema = z.looseObject({
    id: z.string(),
    name: z.string(),
    weight: number_schema(z.number()),
    amount: number_schema(z.number().int()),
    width: number_schema(z.number()),
    length: number_schema(z.number()),
    height: number_schema(z.number()),
    current_rotation: z.enum(ROTATION_VALUES),
    rotations: z.array(z.enum(ROTATION_VALUES)),
    supported_weight: number_schema(z.number().default(0)),
    priority: z.preprocess(read_priority, z.boolean()),
    type: z.string().default(''),
    unlimited: z.boolean().default(false),
    volume: number_schema(z.number().optional()),
})
