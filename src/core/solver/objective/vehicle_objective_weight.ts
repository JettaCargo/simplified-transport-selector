import { TRANSPORT_CHOICE_CRITERIA } from '../../input/schema/selector_input_vocabulary'
import { supported_weight_with_gap } from '../../scale/capacity/supported_weight_with_gap'
import { volume_with_gap } from '../../scale/capacity/volume_with_gap'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { Selector_Request } from '../../input/request/selector_request'

const AMOUNT_SCALE = 10
const VOLUME_SCALE = 1000
const WEIGHT_SCALE = 100000
const COST_SCALE = 1000

/**
 * Builds the per-type objective weight from the choice criteria.
 * @param vehicle vehicle
 * @param request request
 * @param ranked_cost cost ranks
 * @returns objective coefficient
 */
export function vehicle_objective_weight(
    vehicle: Parsed_Vehicle,
    request: Selector_Request,
    ranked_cost: Map<string, number>,
): number
{
    let weight = (ranked_cost.get(vehicle.id) || 0) / COST_SCALE
    weight += criteria_weight(vehicle, request)
    if (vehicle.unlimited)
    {
        weight += 0.1
    }
    return Number(weight.toFixed(6))
}

/**
 * @param vehicle vehicle
 * @param request request
 * @returns criteria contribution
 */
function criteria_weight(vehicle: Parsed_Vehicle, request: Selector_Request): number
{
    const criteria = [request.first_criteria, request.second_criteria]
    let weight = 0
    if (counts_as_amount(criteria))
    {
        weight += AMOUNT_SCALE
    }
    if (criteria.includes(TRANSPORT_CHOICE_CRITERIA.VOLUME))
    {
        weight += volume_with_gap(vehicle, request.gaps.volume) / VOLUME_SCALE
    }
    if (criteria.includes(TRANSPORT_CHOICE_CRITERIA.WEIGHT))
    {
        weight += supported_weight_with_gap(vehicle, request.gaps.weight) / WEIGHT_SCALE
    }
    return weight
}

/**
 * @param criteria first and second criteria
 * @returns whether amount is the active criterion
 */
function counts_as_amount(criteria: string[]): boolean
{
    if (criteria.includes(TRANSPORT_CHOICE_CRITERIA.AMOUNT))
    {
        return true
    }
    return criteria.every(value => value === TRANSPORT_CHOICE_CRITERIA.DISABLED)
}
