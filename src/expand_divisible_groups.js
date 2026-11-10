const { group_fits_vehicle } = require('./fit')

/**
 * Splits groups that do not fit any vehicle into per-unit item groups.
 * Parent collect id is kept for the response via parent_id.
 * @param {object[]} groups groups
 * @param {object[]} vehicles vehicles
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {object[]}
 */
function expand_divisible_groups(groups, vehicles, gaps)
{
    const expanded = []
    for (const group of groups)
    {
        if (vehicles.some(vehicle => group_fits_vehicle(group, vehicle, gaps)))
        {
            expanded.push({ ...group, parent_id: group.id })
            continue
        }
        expanded.push(...split_group_into_items(group))
    }
    return expanded
}

/**
 * @param {object} group group that must be divided
 * @returns {object[]}
 */
function split_group_into_items(group)
{
    const pieces = []
    let index = 0
    for (const item of group.items)
    {
        const amount = item.amount || 1
        for (let unit = 0; unit < amount; unit++)
        {
            const piece_item = { ...item, amount: 1 }
            const volume = piece_item.volume ?? piece_item.length * piece_item.width * piece_item.height
            pieces.push({
                id: `${group.id}__item__${item.id}__${index}`,
                parent_id: group.id,
                items: [piece_item],
                weight: piece_item.weight,
                volume,
                blacklist: group.blacklist,
            })
            index += 1
        }
    }
    return pieces
}

module.exports = { expand_divisible_groups }
