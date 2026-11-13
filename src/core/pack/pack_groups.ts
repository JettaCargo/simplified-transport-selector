import { cp, DEFAULT_EPSILON, le } from '@jetta/number-compare'
import { supported_weight_with_gap } from '../scale/supported_weight_with_gap'
import { volume_with_gap } from '../scale/volume_with_gap'
import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'

interface Packed_Bin
{
    weight: number
    volume: number
    groups: Collect_Group[]
}

/**
 * Packs groups of one type into the chosen number of vehicles.
 * @param groups groups assigned to the type
 * @param vehicle vehicle type
 * @param packing count and gaps
 * @returns bins, or undefined when the count is insufficient
 */
export function pack_groups(
    groups: Collect_Group[],
    vehicle: Parsed_Vehicle,
    packing: { count: number, gaps: Capacity_Gaps },
): Collect_Group[][] | undefined
{
    if (packing.count <= 0)
    {
        return groups.length === 0 ? [] : undefined
    }
    const bins = Array.from({ length: packing.count }, empty_bin)
    const placed = place_groups(bins, groups, { vehicle, gaps: packing.gaps })
    if (!placed)
    {
        return undefined
    }
    return bins.map(bin => bin.groups)
}

/**
 * @returns an empty bin
 */
function empty_bin(): Packed_Bin
{
    return { weight: 0, volume: 0, groups: [] }
}

/**
 * @param groups groups
 * @param weight_cap weight capacity
 * @param volume_cap volume capacity
 * @returns groups ordered by fill ratio
 */
function order_groups(groups: Collect_Group[], weight_cap: number, volume_cap: number): Collect_Group[]
{
    return [...groups].sort((left, right) => cp(fill_ratio(right, weight_cap, volume_cap), fill_ratio(left, weight_cap, volume_cap), DEFAULT_EPSILON))
}

/**
 * @param group group
 * @param weight_cap weight capacity
 * @param volume_cap volume capacity
 * @returns larger of the weight and volume ratios
 */
function fill_ratio(group: Collect_Group, weight_cap: number, volume_cap: number): number
{
    return Math.max(group.weight / weight_cap, group.volume / volume_cap)
}

/**
 * @param bins bins
 * @param groups groups
 * @param limits vehicle and gaps
 * @returns whether every group was placed
 */
function place_groups(
    bins: Packed_Bin[],
    groups: Collect_Group[],
    limits: { vehicle: Parsed_Vehicle, gaps: Capacity_Gaps },
): boolean
{
    const weight_cap = supported_weight_with_gap(limits.vehicle, limits.gaps.weight)
    const volume_cap = volume_with_gap(limits.vehicle, limits.gaps.volume)
    for (const group of order_groups(groups, weight_cap, volume_cap))
    {
        const caps = { weight: weight_cap, volume: volume_cap }
        const bin = bins.find(candidate => bin_fits(candidate, group, caps))
        if (!bin)
        {
            return false
        }
        bin.weight += group.weight
        bin.volume += group.volume
        bin.groups.push(group)
    }
    return true
}

/**
 * @param candidate bin
 * @param group group
 * @param caps weight and volume capacities
 * @returns whether the group fits in the bin
 */
function bin_fits(candidate: Packed_Bin, group: Collect_Group, caps: { weight: number, volume: number }): boolean
{
    return le(candidate.weight + group.weight, caps.weight) && le(candidate.volume + group.volume, caps.volume)
}
