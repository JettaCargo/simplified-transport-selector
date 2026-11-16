import { Collect_Group } from '../../input/group/collect_group'
import { Selector_Request } from '../../input/request/selector_request'
import { Solver_Solution } from '../../solver/highs/read_solution'

/**
 * Groups the request's groups by the vehicle type the solver assigned them to.
 * @param request request
 * @param solution solver output
 * @returns groups by vehicle id, or undefined when a group has no assignment
 */
export function group_by_assignment(request: Selector_Request, solution: Solver_Solution): Map<string, Collect_Group[]> | undefined
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
