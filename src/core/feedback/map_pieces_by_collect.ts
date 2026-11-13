import { Collect_Group } from '../types/collect_group'

/**
 * Maps each collect id to the group ids that represent it.
 * @param groups groups
 * @returns pieces by collect id
 */
export function map_pieces_by_collect(groups: Collect_Group[]): Map<string, string[]>
{
    const map = new Map<string, string[]>()
    for (const group of groups)
    {
        push_piece(map, group.parent_id || group.id, group.id)
    }
    return map
}

/**
 * @param map pieces by collect
 * @param collect_id collect id
 * @param group_id group id
 */
function push_piece(map: Map<string, string[]>, collect_id: string, group_id: string): void
{
    const list = map.get(collect_id) || []
    list.push(group_id)
    map.set(collect_id, list)
}
