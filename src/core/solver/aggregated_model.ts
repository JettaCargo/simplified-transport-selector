import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'

/**
 * Type-level MILP and the keys needed to read its solution.
 */
export interface Aggregated_Model
{
    lp: string
    assignment_keys: string[]
    count_keys: string[]
    groups: Collect_Group[]
    vehicles: Parsed_Vehicle[]
}
