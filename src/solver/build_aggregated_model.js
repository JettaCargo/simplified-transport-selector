const { group_fits_vehicle } = require('../fit')
const { supported_weight_with_gap, volume_with_gap } = require('../capacity')
const { rank_vehicle_costs, vehicle_objective_weight } = require('./vehicle_objective_weight')
const { sanitize, add_minimum_required } = require('./lp_helpers')
const { parse_reselection_feedback } = require('../feedback/parse_reselection_feedback')
const { build_co_load_cuts } = require('../feedback/build_co_load_cuts')

/**
 * Builds a type-level MILP in LP format.
 * Variables: x_g_t (group→type binary), n_t (vehicle count integer).
 * @param {object} request parsed request
 * @returns {{lp: string, assignment_keys: string[], count_keys: string[]}}
 */
function build_aggregated_model(request)
{
    const { groups, vehicles, gaps, config } = request
    const assignment_keys = []
    const count_keys = []
    const objective = []
    const constraints = []
    const binaries = []
    const generals = []
    const bounds = []
    const ranked_cost = rank_vehicle_costs(vehicles)

    for (const vehicle of vehicles)
    {
        const count_name = sanitize(`n_${vehicle.id}`)
        count_keys.push(count_name)
        generals.push(count_name)
        const upper = vehicle.unlimited ? null : vehicle.stock
        bounds.push(upper == null ? `${count_name} >= 0` : `0 <= ${count_name} <= ${upper}`)
        objective.push(`${vehicle_objective_weight(vehicle, request, ranked_cost)} ${count_name}`)
    }

    for (const group of groups)
        add_group_assignment(group, vehicles, gaps, assignment_keys, binaries, constraints, objective)

    for (const vehicle of vehicles)
        add_capacity_rows(vehicle, groups, gaps, constraints)

    add_minimum_required(constraints, vehicles, gaps, config, count_keys)
    add_feedback_cuts(constraints, request, groups, vehicles)

    const lp = [
        'Minimize',
        ` obj: ${objective.join(' + ')}`,
        'Subject To',
        ...constraints.map(line => ` ${line}`),
        'Bounds',
        ...bounds.map(line => ` ${line}`),
        'General',
        ...generals.map(line => ` ${line}`),
        'Binary',
        ...binaries.map(line => ` ${line}`),
        'End',
    ].join('\n')

    return { lp, assignment_keys, count_keys, groups, vehicles }
}

/**
 * @param {object} group group
 * @param {object[]} vehicles vehicles
 * @param {object} gaps gaps
 * @param {string[]} assignment_keys keys
 * @param {string[]} binaries binaries
 * @param {string[]} constraints constraints
 * @param {string[]} objective objective
 */
function add_group_assignment(group, vehicles, gaps, assignment_keys, binaries, constraints, objective)
{
    const terms = []
    for (const vehicle of vehicles)
    {
        if (!group_fits_vehicle(group, vehicle, gaps))
            continue
        const name = sanitize(`x_${group.id}_${vehicle.id}`)
        assignment_keys.push(name)
        binaries.push(name)
        terms.push(name)
        objective.push(`0.001 ${name}`)
    }
    if (terms.length === 0)
        throw new Error(`no_vehicle_for_group:${group.id}`)
    constraints.push(`assign_${sanitize(group.id)}: ${terms.join(' + ')} = 1`)
}

/**
 * @param {object} vehicle vehicle
 * @param {object[]} groups groups
 * @param {object} gaps gaps
 * @param {string[]} constraints constraints
 */
function add_capacity_rows(vehicle, groups, gaps, constraints)
{
    const count_name = sanitize(`n_${vehicle.id}`)
    const weight_cap = supported_weight_with_gap(vehicle, gaps.weight)
    const volume_cap = volume_with_gap(vehicle, gaps.volume)
    const weight_terms = []
    const volume_terms = []
    const large_terms = []
    for (const group of groups)
    {
        if (!group_fits_vehicle(group, vehicle, gaps))
            continue
        const name = sanitize(`x_${group.id}_${vehicle.id}`)
        weight_terms.push(`${group.weight} ${name}`)
        volume_terms.push(`${group.volume} ${name}`)
        if (group.weight > weight_cap * 0.5 || group.volume > volume_cap * 0.5)
            large_terms.push(name)
    }
    if (weight_terms.length)
        constraints.push(`w_${sanitize(vehicle.id)}: ${weight_terms.join(' + ')} - ${weight_cap} ${count_name} <= 0`)
    if (volume_terms.length)
        constraints.push(`v_${sanitize(vehicle.id)}: ${volume_terms.join(' + ')} - ${volume_cap} ${count_name} <= 0`)
    if (large_terms.length)
        constraints.push(`large_${sanitize(vehicle.id)}: ${large_terms.join(' + ')} - ${count_name} <= 0`)
}

/**
 * Applies gateway reselection bind feedback as MILP cuts.
 * @param {string[]} constraints constraints
 * @param {object} request request
 * @param {object[]} groups groups
 * @param {object[]} vehicles vehicles
 */
function add_feedback_cuts(constraints, request, groups, vehicles)
{
    const known_collects = new Set(groups.map(group => group.parent_id || group.id))
    const known_vehicles = new Set(vehicles.map(vehicle => vehicle.id))
    const cuts = parse_reselection_feedback(
        request.reselection_feedback,
        known_collects,
        known_vehicles,
    )
    constraints.push(...build_co_load_cuts(cuts, groups))
}

module.exports = { build_aggregated_model, sanitize }
