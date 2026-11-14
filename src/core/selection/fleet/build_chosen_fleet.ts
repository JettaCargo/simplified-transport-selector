import { single_type_fleet_applies } from '../../scale/count/single_type_fleet_applies'
import { Chosen_Assignment } from './chosen_assignment'
import { Selector_Request } from '../../input/request/selector_request'
import { Solver_Solution } from '../../solver/highs/read_solution'
import { group_by_assignment } from './group_by_assignment'
import { pack_vehicle_types } from './pack_vehicle_types'
import { scale_single_limited_type } from '../single_limited/scale_single_limited_type'

/**
 * Materializes vehicle clones from counts and assignments.
 * @param request parsed request
 * @param solution solver output
 * @returns chosen clones, or undefined when an assignment or pack fails
 */
export function build_chosen_fleet(request: Selector_Request, solution: Solver_Solution): Chosen_Assignment[] | undefined
{
    const by_type = group_by_assignment(request, solution)
    if (!by_type)
    {
        return undefined
    }
    if (single_type_fleet_applies(request.vehicles))
    {
        return scale_single_limited_type(request, solution)
    }
    return pack_vehicle_types(request, solution, by_type)
}
