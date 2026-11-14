import { Chosen_Assignment } from '../fleet/chosen_assignment'
import { Selector_Request } from '../../input/request/selector_request'
import { emitted_count } from '../../scale/count/emitted_count'
import { group_fits_vehicle } from '../fit/group_fits_vehicle'
import { Solver_Solution } from '../../solver/highs/read_solution'

/**
 * Emits scaled clones that each carry every allowed waypoint.
 * @param request request
 * @param solution solver output
 * @returns chosen clones
 */
export function scale_single_limited_type(request: Selector_Request, solution: Solver_Solution): Chosen_Assignment[]
{
    const vehicle = request.vehicles[0]
    const lp_count = solution.counts.get(vehicle.id) || 0
    const count = emitted_count(lp_count, vehicle.stock ?? 0)
    const allowed = request.groups.filter(group => group_fits_vehicle(group, vehicle, request.gaps))
    return Array.from({ length: count }, () => ({ vehicle, groups: allowed }))
}
