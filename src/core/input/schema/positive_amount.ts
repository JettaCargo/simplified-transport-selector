import { Cargo_Item } from '../group/cargo_item'

/**
 * Drops items with amount below 1, matching JSONFactory.
 * @param items items
 * @returns items with a positive amount
 */
export function positive_amount(items: Cargo_Item[]): Cargo_Item[]
{
    return items.filter(item => item.amount >= 1)
}
