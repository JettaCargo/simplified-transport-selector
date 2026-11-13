import { cp, DEFAULT_EPSILON } from '@jetta/number-compare'
import { Parsed_Vehicle } from '../types/parsed_vehicle'

/**
 * Maps payload cost into dense ranks like GoalFunctionCreator.
 * @param vehicles vehicles
 * @returns rank by vehicle id
 */
export function rank_vehicle_costs(vehicles: Parsed_Vehicle[]): Map<string, number>
{
    const unique = [...new Set(vehicles.map(vehicle => Number(vehicle.cost || 0)))].sort(compare_cost)
    const ranks = new Map(unique.map((cost, index) => [cost, index]))
    return new Map(vehicles.map(vehicle => [vehicle.id, ranks.get(Number(vehicle.cost || 0)) ?? 0]))
}

/**
 * @param left cost
 * @param right cost
 * @returns comparison
 */
function compare_cost(left: number, right: number): number
{
    return cp(left, right, DEFAULT_EPSILON)
}
