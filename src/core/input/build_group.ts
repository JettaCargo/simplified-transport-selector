import { Collect_Group } from '../types/collect_group'
import { Validated_Collect } from './validated_input'

/**
 * Builds one indivisible group from a collect.
 * @param collect collect payload
 * @returns group
 */
export function build_group(collect: Validated_Collect): Collect_Group
{
    const items = collect.items || []
    const weight = items.reduce((total, item) => total + item.weight * (item.amount || 1), 0)
    const volume = items.reduce((total, item) => total + item_volume(item) * (item.amount || 1), 0)
    return {
        id: collect.id,
        items,
        weight,
        volume,
        blacklist: new Set(collect.restrictedToVehicles || []),
    }
}

/**
 * @param item item
 * @returns unit volume
 */
function item_volume(item: { volume?: number, length: number, width: number, height: number }): number
{
    return item.volume ?? item.length * item.width * item.height
}
