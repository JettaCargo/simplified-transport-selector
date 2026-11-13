import { z } from 'zod'
import { collect_schema } from './collect_schema'
import { config_schema } from './config_schema'
import { item_schema } from './item_schema'
import { normalize_criteria } from './normalize_criteria'
import { TRANSPORT_CHOICE_CRITERIA_VALUES } from './selector_input_vocabulary'
import { vehicle_schema } from './vehicle_schema'

const criteria_schema = z.preprocess(normalize_criteria, z.enum(TRANSPORT_CHOICE_CRITERIA_VALUES))

/**
 * Root selector payload. Unknown keys stay on the object.
 */
export const selector_input_schema = z.looseObject({
    vehicles: z.array(vehicle_schema),
    collects: z.array(collect_schema),
    config: config_schema,
    gapWeight: z.number().default(0),
    gapVolume: z.number().default(0),
    first_criteria: criteria_schema,
    second_criteria: criteria_schema,
    log_header: z.string().default(''),
    accessories: z.array(item_schema).default([]),
})
