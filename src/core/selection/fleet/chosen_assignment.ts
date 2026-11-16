import { Collect_Group } from '../../input/group/collect_group'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * One emitted vehicle clone and the groups packed into it.
 */
export interface Chosen_Assignment
{
    vehicle: Parsed_Vehicle
    groups: Collect_Group[]
}
