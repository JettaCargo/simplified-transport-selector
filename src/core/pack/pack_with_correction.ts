import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { pack_groups } from './pack_groups'

/**
 * Packed bins and the count that made them fit.
 */
export interface Packed_Fleet
{
    count: number
    bins: Collect_Group[][]
}

/**
 * Raises count until packing succeeds or stock is exhausted.
 * @param groups groups
 * @param vehicle vehicle
 * @param attempt starting count and gaps
 * @returns packed fleet, or undefined
 */
export function pack_with_correction(
    groups: Collect_Group[],
    vehicle: Parsed_Vehicle,
    attempt: { start_count: number, gaps: Capacity_Gaps },
): Packed_Fleet | undefined
{
    const stock = vehicle.unlimited ? Number.MAX_SAFE_INTEGER : vehicle.stock ?? 0
    let count = Math.max(attempt.start_count, groups.length > 0 ? 1 : 0)
    while (count <= stock)
    {
        const bins = pack_groups(groups, vehicle, { count, gaps: attempt.gaps })
        if (bins)
        {
            return { count, bins }
        }
        count += 1
    }
    return undefined
}
