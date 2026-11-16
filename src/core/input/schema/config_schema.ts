import { z } from 'zod'
import { TRANSPORT_MEASURE_VALUES } from './selector_input_vocabulary'
import { uppercase_string } from './uppercase_string'

const measure_schema = z.preprocess(uppercase_string, z.enum(TRANSPORT_MEASURE_VALUES))

/**
 * Configuration object with Java defaults.
 */
export const config_schema = z.looseObject({
    enable_minimum_required_vehicles: z.boolean().default(false),
    measures_for_transport_choice_heuristics: z.array(measure_schema).default([]),
    minimum_required_volume: z.number().default(0),
    minimum_required_supported_weight: z.number().default(0),
    single_waypoint_per_transport: z.boolean().default(false),
})
