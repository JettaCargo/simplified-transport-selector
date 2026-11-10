const { sanitize } = require('../solver/lp_helpers')

/**
 * Builds LP rows that keep failed co-load collects from sharing one vehicle type.
 * Any piece of collect A on type V forbids any piece of collect B on the same type.
 * @param {{vehicle_id: string, collect_ids: string[]}[]} cuts normalized cuts
 * @param {object[]} groups groups (possibly expanded item pieces)
 * @returns {string[]}
 */
function build_co_load_cuts(cuts, groups = [])
{
    const pieces_by_collect = map_pieces_by_collect(groups)
    const rows = []
    let index = 0
    for (const cut of cuts)
    {
        const piece_lists = cut.collect_ids
            .map(collect_id => pieces_by_collect.get(collect_id) || [collect_id])
            .filter(list => list.length > 0)
        for (let left = 0; left < piece_lists.length; left++)
        {
            for (let right = left + 1; right < piece_lists.length; right++)
            {
                for (const left_id of piece_lists[left])
                {
                    for (const right_id of piece_lists[right])
                    {
                        const left_var = sanitize(`x_${left_id}_${cut.vehicle_id}`)
                        const right_var = sanitize(`x_${right_id}_${cut.vehicle_id}`)
                        rows.push(`feedback_coload_${index}: ${left_var} + ${right_var} <= 1`)
                        index += 1
                    }
                }
            }
        }
    }
    return rows
}

/**
 * @param {object[]} groups groups
 * @returns {Map<string, string[]>}
 */
function map_pieces_by_collect(groups)
{
    const map = new Map()
    for (const group of groups)
    {
        const collect_id = group.parent_id || group.id
        const list = map.get(collect_id) || []
        list.push(group.id)
        map.set(collect_id, list)
    }
    return map
}

module.exports = { build_co_load_cuts }
