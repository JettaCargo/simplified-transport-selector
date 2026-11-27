import { Collect_Group } from '../../input/group/collect_group'

/**
 * Collect ids represented by packed groups, without duplicates.
 * @param groups groups
 * @returns collect ids
 */
export function unique_group_ids(groups: Collect_Group[]): string[]
{
    const seen = new Set<string>()
    const ids: string[] = []
    for (const group of groups)
    {
        push_unique_id(seen, ids, group.parent_id || group.id)
    }
    return ids
}

/**
 * @param seen ids already emitted
 * @param ids result
 * @param id collect id
 */
function push_unique_id(seen: Set<string>, ids: string[], id: string): void
{
    if (seen.has(id))
    {
        return
    }
    seen.add(id)
    ids.push(id)
}
