const { supported_weight_with_gap, volume_with_gap } = require('../capacity')

/**
 * Packs groups of one type into the chosen number of vehicles (FFD).
 * Returns null when the count is insufficient.
 * @param {object[]} groups groups assigned to the type
 * @param {object} vehicle vehicle type
 * @param {number} count vehicle count
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {object[][]|null}
 */
function pack_groups(groups, vehicle, count, gaps)
{
    if (count <= 0)
        return groups.length === 0 ? [] : null
    const weight_cap = supported_weight_with_gap(vehicle, gaps.weight)
    const volume_cap = volume_with_gap(vehicle, gaps.volume)
    const ordered = [...groups].sort((left, right) =>
        Math.max(right.weight / weight_cap, right.volume / volume_cap)
        - Math.max(left.weight / weight_cap, left.volume / volume_cap))
    const bins = Array.from({ length: count }, () => ({ weight: 0, volume: 0, groups: [] }))
    for (const group of ordered)
    {
        const bin = bins.find(candidate =>
            candidate.weight + group.weight <= weight_cap + 1e-9
            && candidate.volume + group.volume <= volume_cap + 1e-9)
        if (!bin)
            return null
        bin.weight += group.weight
        bin.volume += group.volume
        bin.groups.push(group)
    }
    return bins.map(bin => bin.groups)
}

/**
 * Raises count until packing succeeds or stock is exhausted.
 * @param {object[]} groups groups
 * @param {object} vehicle vehicle
 * @param {number} start_count starting count
 * @param {{volume: number, weight: number}} gaps gaps
 * @returns {{count: number, bins: object[][]}|null}
 */
function pack_with_correction(groups, vehicle, start_count, gaps)
{
    const stock = vehicle.unlimited ? Number.MAX_SAFE_INTEGER : vehicle.stock
    let count = Math.max(start_count, groups.length > 0 ? 1 : 0)
    while (count <= stock)
    {
        const bins = pack_groups(groups, vehicle, count, gaps)
        if (bins)
            return { count, bins }
        count += 1
    }
    return null
}

module.exports = { pack_groups, pack_with_correction }
