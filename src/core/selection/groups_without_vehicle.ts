import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { group_fits_vehicle } from './group_fits_vehicle'

/**
 * Finds groups that cannot ride any vehicle.
 * @param groups groups
 * @param vehicles vehicles
 * @param gaps gaps
 * @returns groups with no vehicle
 */
export function groups_without_vehicle(
    groups: Collect_Group[],
    vehicles: Parsed_Vehicle[],
    gaps: Capacity_Gaps,
): Collect_Group[]
{
    return groups.filter(group => !vehicles.some(vehicle => group_fits_vehicle(group, vehicle, gaps)))
}
