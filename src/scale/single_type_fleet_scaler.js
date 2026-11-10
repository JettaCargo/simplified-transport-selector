/**
 * After LP chooses N of one limited type, emit min(3N, stock).
 * Matches SingleTransportTypeFleetScaler in the Java selector.
 * @param {number} lp_chosen_count LP count
 * @param {number} fleet_amount limited stock
 * @returns {number}
 */
function scaled_count(lp_chosen_count, fleet_amount)
{
    return Math.min(lp_chosen_count * 3, fleet_amount)
}

/**
 * @param {number} lp_chosen_count LP count
 * @param {number} fleet_amount limited stock
 * @returns {number}
 */
function emitted_count(lp_chosen_count, fleet_amount)
{
    if (lp_chosen_count < 1)
        return fleet_amount
    return scaled_count(lp_chosen_count, fleet_amount)
}

/**
 * True when exactly one limited type with stock greater than 1 is present.
 * @param {object[]} vehicles vehicles
 * @returns {boolean}
 */
function applies(vehicles)
{
    return vehicles.length === 1 && !vehicles[0].unlimited && vehicles[0].stock > 1
}

module.exports = { scaled_count, emitted_count, applies }
