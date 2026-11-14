import { gt } from '@jetta/number-compare'
import { supported_weight_with_gap } from '../../scale/capacity/supported_weight_with_gap'
import { volume_with_gap } from '../../scale/capacity/volume_with_gap'
import { Capacity_Gaps } from '../../scale/capacity/capacity_gaps'
import { Collect_Group } from '../../input/group/collect_group'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { items_fit_vehicle } from './items_fit_vehicle'

/**
 * Returns whether a group may be assigned to a vehicle type.
 * @param group group
 * @param vehicle vehicle type
 * @param gaps gaps
 * @returns whether the group fits
 */
export function group_fits_vehicle(group: Collect_Group, vehicle: Parsed_Vehicle, gaps: Capacity_Gaps): boolean
{
    if (group.blacklist.has(vehicle.id))
    {
        return false
    }
    const weight_cap = supported_weight_with_gap(vehicle, gaps.weight)
    const volume_cap = volume_with_gap(vehicle, gaps.volume)
    if (gt(group.weight, weight_cap) || gt(group.volume, volume_cap))
    {
        return false
    }
    return items_fit_vehicle(group.items, vehicle)
}
