const { group_fits_vehicle } = require('../fit')

/**
 * Moves co-loaded groups onto empty vehicle clones that can carry them alone.
 * Drops slots that stay empty so the response never emits collects:[].
 * @param {Array<{vehicle: object, groups: object[]}>} chosen packed fleet
 * @param {{volume: number, weight: number}} gaps capacity gaps
 * @returns {Array<{vehicle: object, groups: object[]}>}
 */
function rebind_empty_vehicle_slots(chosen, gaps)
{
    for (const empty_entry of chosen)
    {
        if (empty_entry.groups.length > 0)
            continue
        const moved = take_fitting_group_from_coloads(chosen, empty_entry.vehicle, gaps)
        if (moved)
            empty_entry.groups.push(moved)
    }
    return chosen.filter(entry => entry.groups.length > 0)
}

/**
 * Peels one group that fits the target vehicle from a multi-collect donor.
 * Prefers lighter groups so large co-loads stay on the heavy truck.
 * @param {Array<{vehicle: object, groups: object[]}>} chosen fleet
 * @param {object} target_vehicle empty vehicle type
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {object|null}
 */
function take_fitting_group_from_coloads(chosen, target_vehicle, gaps)
{
    let best = null
    for (const entry of chosen)
    {
        if (entry.groups.length < 2)
            continue
        for (let index = 0; index < entry.groups.length; index += 1)
        {
            const group = entry.groups[index]
            if (!group_fits_vehicle(group, target_vehicle, gaps))
                continue
            if (!best || group.weight < best.group.weight)
                best = { entry, index, group }
        }
    }
    if (!best)
        return null
    best.entry.groups.splice(best.index, 1)
    return best.group
}

module.exports = { rebind_empty_vehicle_slots }
