const { supported_weight_with_gap, volume_with_gap } = require('../capacity')

/**
 * Maps payload cost into dense ranks like GoalFunctionCreator.
 * @param {object[]} vehicles vehicles
 * @returns {Map<string, number>}
 */
function rank_vehicle_costs(vehicles)
{
    const unique = [...new Set(vehicles.map(vehicle => Number(vehicle.cost || 0)))].sort((a, b) => a - b)
    const ranks = new Map(unique.map((cost, index) => [cost, index]))
    return new Map(vehicles.map(vehicle => [vehicle.id, ranks.get(Number(vehicle.cost || 0))]))
}

/**
 * Builds the per-type objective weight from AMOUNT / VOLUME / WEIGHT criteria.
 * @param {object} vehicle vehicle
 * @param {object} request request
 * @param {Map<string, number>} ranked_cost cost ranks
 * @returns {number}
 */
function vehicle_objective_weight(vehicle, request, ranked_cost)
{
    const amount_scale = 10
    const volume_scale = 1000
    const weight_scale = 100000
    const cost_scale = 1000
    let weight = (ranked_cost.get(vehicle.id) || 0) / cost_scale
    const criteria = [request.first_criteria, request.second_criteria]
    if (criteria.includes('AMOUNT') || criteria.every(value => value === 'DISABLED'))
        weight += amount_scale
    if (criteria.includes('VOLUME'))
        weight += volume_with_gap(vehicle, request.gaps.volume) / volume_scale
    if (criteria.includes('WEIGHT'))
        weight += supported_weight_with_gap(vehicle, request.gaps.weight) / weight_scale
    if (vehicle.unlimited)
        weight += 0.1
    return Number(weight.toFixed(6))
}

module.exports = { rank_vehicle_costs, vehicle_objective_weight }
