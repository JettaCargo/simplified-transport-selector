/**
 * Keeps known collect ids, dropping duplicates and unknown ids.
 * @param collect_ids raw ids
 * @param known_collect_ids known ids
 * @returns unique known ids
 */
export function unique_known_collects(collect_ids: unknown, known_collect_ids: Set<string>): string[]
{
    if (!Array.isArray(collect_ids))
    {
        return []
    }
    const seen = new Set<string>()
    const result: string[] = []
    for (const id of collect_ids)
    {
        push_known(result, seen, { id, known_collect_ids })
    }
    return result
}

/**
 * @param result collected ids
 * @param seen ids already kept
 * @param candidate id and the known set
 */
function push_known(result: string[], seen: Set<string>, candidate: { id: unknown, known_collect_ids: Set<string> }): void
{
    const { id, known_collect_ids } = candidate
    if (typeof id !== 'string' || !known_collect_ids.has(id) || seen.has(id))
    {
        return
    }
    seen.add(id)
    result.push(id)
}
