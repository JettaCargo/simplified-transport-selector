import { pack_with_correction } from '../pack/pack_with_correction'
import { Chosen_Assignment } from '../types/chosen_assignment'
import { Collect_Group } from '../types/collect_group'
import { Selector_Request } from '../types/selector_request'
import { Solver_Solution } from '../solver/read_solution'

/**
 * Packs each vehicle type into the counted number of clones.
 * @param request request
 * @param solution solver output
 * @param by_type groups by vehicle id
 * @returns chosen clones, or undefined when packing fails
 */
export function pack_vehicle_types(
    request: Selector_Request,
    solution: Solver_Solution,
    by_type: Map<string, Collect_Group[]>,
): Chosen_Assignment[] | undefined
{
    const chosen: Chosen_Assignment[] = []
    for (const vehicle of request.vehicles)
    {
        const packed = pack_vehicle(request, solution, { by_type, vehicle_id: vehicle.id })
        if (packed === null)
        {
            continue
        }
        if (!packed)
        {
            return undefined
        }
        chosen.push(...packed)
    }
    return chosen
}

/**
 * @param request request
 * @param solution solver output
 * @param slot groups by type and the vehicle id
 * @returns clones, undefined on failure, or null when the type is unused
 */
function pack_vehicle(
    request: Selector_Request,
    solution: Solver_Solution,
    slot: { by_type: Map<string, Collect_Group[]>, vehicle_id: string },
): Chosen_Assignment[] | undefined | null
{
    const vehicle = request.vehicles.find(candidate => candidate.id === slot.vehicle_id)
    if (!vehicle)
    {
        return undefined
    }
    const groups = slot.by_type.get(vehicle.id) || []
    const start = solution.counts.get(vehicle.id) || 0
    if (start === 0 && groups.length === 0)
    {
        return null
    }
    const packed = pack_with_correction(groups, vehicle, { start_count: start, gaps: request.gaps })
    if (!packed)
    {
        return undefined
    }
    return packed.bins.map(bin => ({ vehicle, groups: bin.length ? bin : groups }))
}
