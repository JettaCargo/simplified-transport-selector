const { supported_weight_with_gap, volume_with_gap } = require('./capacity')

/**
 * Returns whether a group may be assigned to a vehicle type.
 * @param {object} group group
 * @param {object} vehicle vehicle type
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {boolean}
 */
function group_fits_vehicle(group, vehicle, gaps)
{
    if (group.blacklist.has(vehicle.id))
        return false
    const weight_cap = supported_weight_with_gap(vehicle, gaps.weight)
    const volume_cap = volume_with_gap(vehicle, gaps.volume)
    if (group.weight > weight_cap + 1e-9)
        return false
    if (group.volume > volume_cap + 1e-9)
        return false
    return items_fit_vehicle(group.items, vehicle)
}

/**
 * Checks item geometry and weight against the largest container.
 * @param {object[]} items items
 * @param {object} vehicle vehicle
 * @returns {boolean}
 */
function items_fit_vehicle(items, vehicle)
{
    const containers = vehicle.containers || []
    if (containers.length === 0)
        return false
    for (const item of items)
    {
        const amount = item.amount || 1
        if (item.weight * amount > vehicle.supported_weight + 1e-9)
            return false
        if (!item_fits_any_container(item, containers))
            return false
    }
    return true
}

/**
 * Tries POS1 dimensions against every container.
 * @param {object} item item
 * @param {object[]} containers containers
 * @returns {boolean}
 */
function item_fits_any_container(item, containers)
{
    const orientations = item_orientations(item)
    return containers.some(container =>
        orientations.some(([length, width, height]) =>
            length <= container.length + 1e-9
            && width <= container.width + 1e-9
            && height <= container.height + 1e-9))
}

/**
 * Builds dimension orientations from declared rotations.
 * @param {object} item item
 * @returns {number[][]}
 */
function item_orientations(item)
{
    const length = item.length || 0
    const width = item.width || 0
    const height = item.height || 0
    const rotations = item.rotations || ['POS1']
    const orientations = [[length, width, height]]
    if (rotations.includes('POS4'))
        orientations.push([width, length, height])
    return orientations
}

/**
 * Finds groups that cannot ride any vehicle.
 * @param {object[]} groups groups
 * @param {object[]} vehicles vehicles
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {object[]}
 */
function groups_without_vehicle(groups, vehicles, gaps)
{
    return groups.filter(group => !vehicles.some(vehicle => group_fits_vehicle(group, vehicle, gaps)))
}

module.exports = { group_fits_vehicle, groups_without_vehicle }
