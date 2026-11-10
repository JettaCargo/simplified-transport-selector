const { supported_weight_with_gap, volume_with_gap } = require('../capacity')

/**
 * LP-safe identifier.
 * @param {string} value raw id
 * @returns {string}
 */
function sanitize(value)
{
    return String(value).replace(/[^A-Za-z0-9_]/g, '_')
}

/**
 * Adds global minimum volume/weight capacity rows.
 * @param {string[]} constraints constraint list
 * @param {object[]} vehicles vehicles
 * @param {object} gaps gaps
 * @param {object} config config
 * @param {string[]} count_keys count variable names
 */
function add_minimum_required(constraints, vehicles, gaps, config, count_keys)
{
    const min_volume = Number(config.minimum_required_volume || 0)
    const min_weight = Number(config.minimum_required_supported_weight || 0)
    if (min_volume > 0)
    {
        const terms = vehicles.map((vehicle, index) =>
            `${volume_with_gap(vehicle, gaps.volume)} ${count_keys[index]}`)
        constraints.push(`min_vol: ${terms.join(' + ')} >= ${min_volume}`)
    }
    if (min_weight > 0)
    {
        const terms = vehicles.map((vehicle, index) =>
            `${supported_weight_with_gap(vehicle, gaps.weight)} ${count_keys[index]}`)
        constraints.push(`min_weight: ${terms.join(' + ')} >= ${min_weight}`)
    }
}

module.exports = { sanitize, add_minimum_required }
