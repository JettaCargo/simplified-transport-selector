/**
 * Normalizes reselection_feedback from the gateway into co-load cuts.
 * Entries need at least two known collect ids and a known vehicle id.
 * @param {object|undefined} feedback raw feedback
 * @param {Set<string>} known_collect_ids collect ids in this request
 * @param {Set<string>} known_vehicle_ids vehicle ids in this request
 * @returns {{vehicle_id: string, collect_ids: string[]}[]}
 */
function parse_reselection_feedback(feedback, known_collect_ids, known_vehicle_ids)
{
    const failed = Array.isArray(feedback?.failed_co_loads) ? feedback.failed_co_loads : []
    const cuts = []
    for (const entry of failed)
    {
        const vehicle_id = entry && entry.vehicle_id
        if (!vehicle_id || !known_vehicle_ids.has(vehicle_id))
            continue
        const collect_ids = unique_known_collects(entry.collect_ids, known_collect_ids)
        if (collect_ids.length < 2)
            continue
        cuts.push({ vehicle_id, collect_ids })
    }
    return cuts
}

/**
 * @param {unknown} collect_ids raw ids
 * @param {Set<string>} known_collect_ids known ids
 * @returns {string[]}
 */
function unique_known_collects(collect_ids, known_collect_ids)
{
    if (!Array.isArray(collect_ids))
        return []
    const seen = new Set()
    const result = []
    for (const id of collect_ids)
    {
        if (!known_collect_ids.has(id) || seen.has(id))
            continue
        seen.add(id)
        result.push(id)
    }
    return result
}

module.exports = { parse_reselection_feedback }
