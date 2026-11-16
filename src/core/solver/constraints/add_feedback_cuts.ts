import { build_co_load_cuts } from '../../feedback/cuts/build_co_load_cuts'
import { parse_reselection_feedback } from '../../feedback/parse/parse_reselection_feedback'
import { Selector_Request } from '../../input/request/selector_request'

/**
 * Applies gateway reselection bind feedback as MILP cuts.
 * @param constraints constraints
 * @param request request
 */
export function add_feedback_cuts(constraints: string[], request: Selector_Request): void
{
    const known_collects = new Set(request.groups.map(group => group.parent_id || group.id))
    const known_vehicles = new Set(request.vehicles.map(vehicle => vehicle.id))
    const cuts = parse_reselection_feedback(request.reselection_feedback, known_collects, known_vehicles)
    constraints.push(...build_co_load_cuts(cuts, request.groups))
}
