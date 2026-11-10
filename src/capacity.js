/**
 * Sums container volumes of a vehicle.
 * @param {object} vehicle vehicle with containers
 * @returns {number}
 */
function vehicle_volume(vehicle)
{
    return (vehicle.containers || []).reduce(
        (total, container) => total + container.length * container.width * container.height,
        0,
    )
}

/**
 * Supported weight with gap applied the same way as CollectionsUtils.
 * @param {object} vehicle vehicle
 * @param {number} gap_weight gap fraction
 * @returns {number}
 */
function supported_weight_with_gap(vehicle, gap_weight)
{
    const raw = vehicle.supported_weight - vehicle.supported_weight * gap_weight
    return Number(raw.toFixed(7))
}

/**
 * Volume with gap applied the same way as CollectionsUtils.
 * @param {object} vehicle vehicle
 * @param {number} gap_volume gap fraction
 * @returns {number}
 */
function volume_with_gap(vehicle, gap_volume)
{
    const volume = vehicle_volume(vehicle)
    return volume - volume * gap_volume
}

/**
 * Ceiling of vehicles needed to cover a required capacity.
 * @param {number} required required capacity
 * @param {number} per_vehicle capacity of one vehicle
 * @returns {number}
 */
function vehicles_for_capacity(required, per_vehicle)
{
    if (required <= 0)
        return 0
    if (per_vehicle <= 0)
        return Number.POSITIVE_INFINITY
    return Math.ceil(required / per_vehicle)
}

module.exports = {
    vehicle_volume,
    supported_weight_with_gap,
    volume_with_gap,
    vehicles_for_capacity,
}
