import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { Selector_Request } from '../types/selector_request'
import { Model_Context } from './model_context'
import { sanitize } from './sanitize'
import { vehicle_objective_weight } from './vehicle_objective_weight'

/**
 * Adds one integer count variable per vehicle type.
 * @param context model pieces
 * @param request request
 * @param ranked_cost cost ranks
 */
export function add_vehicle_counts(
    context: Model_Context,
    request: Selector_Request,
    ranked_cost: Map<string, number>,
): void
{
    for (const vehicle of context.vehicles)
    {
        add_count_variable(context, request, { cost: ranked_cost, vehicle })
    }
}

/**
 * @param context model pieces
 * @param request request
 * @param ranked cost ranks and the vehicle
 */
function add_count_variable(
    context: Model_Context,
    request: Selector_Request,
    ranked: { cost: Map<string, number>, vehicle: Parsed_Vehicle },
): void
{
    const count_name = sanitize(`n_${ranked.vehicle.id}`)
    context.count_keys.push(count_name)
    context.generals.push(count_name)
    context.bounds.push(count_bound(count_name, ranked.vehicle))
    const weight = vehicle_objective_weight(ranked.vehicle, request, ranked.cost)
    context.objective.push(`${weight} ${count_name}`)
}

/**
 * @param count_name count variable
 * @param vehicle vehicle
 * @returns bound row
 */
function count_bound(count_name: string, vehicle: Parsed_Vehicle): string
{
    if (vehicle.unlimited || vehicle.stock == null)
    {
        return `${count_name} >= 0`
    }
    return `0 <= ${count_name} <= ${vehicle.stock}`
}
