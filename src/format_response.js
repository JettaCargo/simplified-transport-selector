/**
 * Formats chosen vehicle clones into the Java selector response shape.
 * @param {object[]} chosen list of {vehicle, groups}
 * @returns {{vehicles_array: object[]}}
 */
function format_response(chosen)
{
    return {
        vehicles_array: chosen.map(entry => ({
            vehicle: clone_vehicle_json(entry.vehicle),
            collects: unique_group_ids(entry.groups).map(id => ({ id })),
        })),
    }
}

/**
 * @param {object} vehicle vehicle type
 * @returns {object}
 */
function clone_vehicle_json(vehicle)
{
    return {
        id: vehicle.id,
        name: vehicle.name,
        amount: 1,
        unlimited: vehicle.unlimited,
        cost: vehicle.cost,
        supported_weight: vehicle.supported_weight,
        containers: vehicle.containers,
    }
}

/**
 * @param {object[]} groups groups
 * @returns {string[]}
 */
function unique_group_ids(groups)
{
    const seen = new Set()
    const ids = []
    for (const group of groups)
    {
        const id = group.parent_id || group.id
        if (seen.has(id))
            continue
        seen.add(id)
        ids.push(id)
    }
    return ids
}

module.exports = { format_response }
