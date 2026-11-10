const { parse_request } = require('./parse_request')
const { groups_without_vehicle, group_fits_vehicle } = require('./fit')
const { expand_divisible_groups } = require('./expand_divisible_groups')
const { items_dont_fit_response } = require('./errors')
const { build_aggregated_model } = require('./solver/build_aggregated_model')
const { solve_lp } = require('./solver/highs_client')
const { read_solution } = require('./solver/read_solution')
const { pack_with_correction } = require('./pack/bin_pack_groups')
const { applies: scaler_applies, emitted_count } = require('./scale/single_type_fleet_scaler')
const { format_response } = require('./format_response')

/**
 * Selects transports with a type-level MILP plus bin packing.
 * @param {object} payload Java selector request body
 * @returns {Promise<object>} vehicles_array response or error payload
 */
async function select_transports(payload)
{
    const request = parse_request(payload)
    request.groups = expand_divisible_groups(request.groups, request.vehicles, request.gaps)
    const impossible = groups_without_vehicle(request.groups, request.vehicles, request.gaps)
    if (impossible.length > 0)
        return items_dont_fit_response(impossible.map(group => group.parent_id || group.id).join(','))

    let model
    try
    {
        model = build_aggregated_model(request)
    }
    catch (error)
    {
        return items_dont_fit_response(error.message)
    }

    const result = await solve_lp(model.lp)
    if (result.Status !== 'Optimal' && result.Status !== 'OptimalInfeas')
        return items_dont_fit_response(`solver_status=${result.Status}`)

    const solution = read_solution(result, request.groups, request.vehicles)
    const chosen = build_chosen_fleet(request, solution)
    if (!chosen)
        return items_dont_fit_response('packing_failed')
    return format_response(chosen)
}

/**
 * Materializes vehicle clones from counts and assignments.
 * @param {object} request parsed request
 * @param {{counts: Map, assignment: Map}} solution solver output
 * @returns {object[]|null}
 */
function build_chosen_fleet(request, solution)
{
    const by_type = new Map(request.vehicles.map(vehicle => [vehicle.id, []]))
    for (const group of request.groups)
    {
        const vehicle_id = solution.assignment.get(group.id)
        if (!vehicle_id)
            return null
        by_type.get(vehicle_id).push(group)
    }

    if (scaler_applies(request.vehicles))
        return scale_single_limited_type(request, solution, by_type)

    const chosen = []
    for (const vehicle of request.vehicles)
    {
        const groups = by_type.get(vehicle.id) || []
        const start = solution.counts.get(vehicle.id) || 0
        if (start === 0 && groups.length === 0)
            continue
        const packed = pack_with_correction(groups, vehicle, start, request.gaps)
        if (!packed)
            return null
        for (const bin of packed.bins)
            chosen.push({ vehicle, groups: bin.length ? bin : groups })
    }
    return chosen
}

/**
 * Emits scaled clones that each carry every allowed waypoint.
 * @param {object} request request
 * @param {{counts: Map}} solution solution
 * @param {Map} by_type groups by type
 * @returns {object[]}
 */
function scale_single_limited_type(request, solution, by_type)
{
    const vehicle = request.vehicles[0]
    const lp_count = solution.counts.get(vehicle.id) || 0
    const count = emitted_count(lp_count, vehicle.stock)
    const allowed = request.groups.filter(group => group_fits_vehicle(group, vehicle, request.gaps))
    return Array.from({ length: count }, () => ({ vehicle, groups: allowed }))
}

module.exports = { select_transports }
