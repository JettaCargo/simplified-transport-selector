const { group_fits_vehicle } = require('./fit')
const { pack_with_correction } = require('./pack/bin_pack_groups')
const { applies: scaler_applies, emitted_count } = require('./scale/single_type_fleet_scaler')

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

module.exports = { build_chosen_fleet }
