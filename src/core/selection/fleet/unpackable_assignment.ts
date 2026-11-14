import { pack_with_correction } from '../../pack/pack_with_correction'
import { Selector_Request } from '../../input/request/selector_request'
import { Packing_Cut } from '../../solver/constraints/packing_cut'
import { Solver_Solution } from '../../solver/highs/read_solution'
import { group_by_assignment } from './group_by_assignment'

/**
 * Finds the first vehicle type whose assigned groups first-fit cannot pack within its stock.
 * @param request request
 * @param solution solver output
 * @returns the assignment to forbid, or undefined when no type is to blame
 */
export function unpackable_assignment(request: Selector_Request, solution: Solver_Solution): Packing_Cut | undefined
{
    const by_type = group_by_assignment(request, solution)
    for (const vehicle of by_type ? request.vehicles : [])
    {
        const groups = by_type?.get(vehicle.id) || []
        const start_count = solution.counts.get(vehicle.id) || 0
        if (groups.length > 0 && !pack_with_correction(groups, vehicle, { start_count, gaps: request.gaps }))
        {
            return { vehicle_id: vehicle.id, group_ids: groups.map(group => group.id) }
        }
    }
    return undefined
}
