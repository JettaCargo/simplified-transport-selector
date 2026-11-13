import { Co_Load_Cut } from './co_load_cut'
import { unique_known_collects } from './unique_known_collects'

/**
 * Normalizes reselection_feedback into co-load cuts.
 * @param feedback raw feedback
 * @param known_collect_ids collect ids in this request
 * @param known_vehicle_ids vehicle ids in this request
 * @returns cuts with at least two known collects
 */
export function parse_reselection_feedback(
    feedback: unknown,
    known_collect_ids: Set<string>,
    known_vehicle_ids: Set<string>,
): Co_Load_Cut[]
{
    const failed = failed_co_loads(feedback)
    const cuts: Co_Load_Cut[] = []
    for (const entry of failed)
    {
        push_cut(cuts, entry, { collect_ids: known_collect_ids, vehicle_ids: known_vehicle_ids })
    }
    return cuts
}

/**
 * @param feedback raw feedback
 * @returns failed co-load entries
 */
function failed_co_loads(feedback: unknown): unknown[]
{
    if (!feedback || typeof feedback !== 'object' || !('failed_co_loads' in feedback))
    {
        return []
    }
    const failed = (feedback as { failed_co_loads?: unknown }).failed_co_loads
    return Array.isArray(failed) ? failed : []
}

/**
 * @param cuts collected cuts
 * @param entry raw entry
 * @param known known collect and vehicle ids
 */
function push_cut(
    cuts: Co_Load_Cut[],
    entry: unknown,
    known: { collect_ids: Set<string>, vehicle_ids: Set<string> },
): void
{
    if (!entry || typeof entry !== 'object')
    {
        return
    }
    const vehicle_id = (entry as { vehicle_id?: unknown }).vehicle_id
    if (typeof vehicle_id !== 'string' || !known.vehicle_ids.has(vehicle_id))
    {
        return
    }
    const collect_ids = unique_known_collects((entry as { collect_ids?: unknown }).collect_ids, known.collect_ids)
    if (collect_ids.length < 2)
    {
        return
    }
    cuts.push({ vehicle_id, collect_ids })
}
