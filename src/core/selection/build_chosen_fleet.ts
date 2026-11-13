import { single_type_fleet_applies } from '../scale/single_type_fleet_applies'
import { Chosen_Assignment } from '../types/chosen_assignment'
import { Collect_Group } from '../types/collect_group'
import { Selector_Request } from '../types/selector_request'
import { Solver_Solution } from '../solver/read_solution'
import { pack_vehicle_types } from './pack_vehicle_types'
import { scale_single_limited_type } from './scale_single_limited_type'

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

/**
 * @param request request
 * @param solution solver output
 * @returns groups by vehicle id, or undefined when a group has no assignment
 */
function group_by_assignment(request: Selector_Request, solution: Solver_Solution): Map<string, Collect_Group[]> | undefined
{
    const by_type = new Map<string, Collect_Group[]>(request.vehicles.map(vehicle => [vehicle.id, []]))
    for (const group of request.groups)
    {
        const vehicle_id = solution.assignment.get(group.id)
        const groups = vehicle_id ? by_type.get(vehicle_id) : undefined
        if (!groups)
        {
            return undefined
        }
        groups.push(group)
    }
    return by_type
}
