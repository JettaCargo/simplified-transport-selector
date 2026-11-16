import { Collect_Group } from '../../input/group/collect_group'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * Pieces accumulated while the LP text is built.
 */
export interface Model_Context
{
    groups: Collect_Group[]
    vehicles: Parsed_Vehicle[]
    assignment_keys: string[]
    count_keys: string[]
    objective: string[]
    constraints: string[]
    binaries: string[]
    generals: string[]
    bounds: string[]
}
