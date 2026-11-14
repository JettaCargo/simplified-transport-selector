import { Collect_Group } from '../../input/group/collect_group'
import { Cargo_Item } from '../../input/group/cargo_item'

/**
 * Splits a group that fits no vehicle into one group per item unit.
 * @param group group that must be divided
 * @returns unit groups
 */
export function split_group_into_items(group: Collect_Group): Collect_Group[]
{
    const pieces: Collect_Group[] = []
    let index = 0
    for (const item of group.items)
    {
        index = push_item_units(pieces, group, { item, index })
    }
    return pieces
}

/**
 * @param pieces collected pieces
 * @param group parent group
 * @param unit item and the next piece index
 * @returns next index
 */
function push_item_units(
    pieces: Collect_Group[],
    group: Collect_Group,
    unit: { item: Cargo_Item, index: number },
): number
{
    const amount = unit.item.amount || 1
    let index = unit.index
    for (let offset = 0; offset < amount; offset++)
    {
        pieces.push(piece_group(group, unit.item, index))
        index += 1
    }
    return index
}

/**
 * @param group parent group
 * @param item item
 * @param index piece index
 * @returns one-unit group
 */
function piece_group(group: Collect_Group, item: Cargo_Item, index: number): Collect_Group
{
    const piece_item = { ...item, amount: 1 }
    const volume = piece_item.volume ?? piece_item.length * piece_item.width * piece_item.height
    return {
        id: `${group.id}__item__${item.id}__${index}`,
        parent_id: group.id,
        items: [piece_item],
        weight: piece_item.weight,
        volume,
        blacklist: group.blacklist,
    }
}
