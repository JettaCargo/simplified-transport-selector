import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { group_fits_vehicle } from './group_fits_vehicle'
import { split_group_into_items } from './split_group_into_items'

/**
 * Splits groups that do not fit any vehicle into per-unit item groups.
 * @param groups groups
 * @param vehicles vehicles
 * @param gaps gaps
 * @returns expanded groups
 */
export function expand_divisible_groups(
    groups: Collect_Group[],
    vehicles: Parsed_Vehicle[],
    gaps: Capacity_Gaps,
): Collect_Group[]
{
    const expanded: Collect_Group[] = []
    for (const group of groups)
    {
        expanded.push(...expand_group(group, vehicles, gaps))
    }
    return expanded
}

/**
 * @param group group
 * @param vehicles vehicles
 * @param gaps gaps
 * @returns the group, or its unit pieces
 */
function expand_group(group: Collect_Group, vehicles: Parsed_Vehicle[], gaps: Capacity_Gaps): Collect_Group[]
{
    if (vehicles.some(vehicle => group_fits_vehicle(group, vehicle, gaps)))
    {
        return [{ ...group, parent_id: group.id }]
    }
    return split_group_into_items(group)
}
