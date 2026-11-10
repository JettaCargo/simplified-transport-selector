const { vehicle_volume } = require('./capacity')

/**
 * Parses the Java selector request into groups and vehicle types.
 * @param {object} payload raw request body
 * @returns {{groups: object[], vehicles: object[], gaps: object, config: object}}
 */
function parse_request(payload)
{
    const gap_volume = Number(payload.gapVolume || 0)
    const gap_weight = Number(payload.gapWeight || 0)
    const config = payload.config || {}
    const vehicles = (payload.vehicles || []).map(vehicle => ({
        ...vehicle,
        volume: vehicle_volume(vehicle),
        stock: vehicle.unlimited ? null : Number(vehicle.amount || 0),
        unlimited: Boolean(vehicle.unlimited),
    }))
    const groups = (payload.collects || [])
        .filter(collect => (collect.items || []).length > 0)
        .map(collect => build_group(collect))
    return {
        groups,
        vehicles,
        gaps: { volume: gap_volume, weight: gap_weight },
        config,
        accept_divided_collect: Boolean(payload.acceptDividedCollect),
        first_criteria: String(payload.first_criteria || 'DISABLED').toUpperCase(),
        second_criteria: String(payload.second_criteria || 'DISABLED').toUpperCase(),
        log_header: payload.log_header || '',
        selection_phase: detect_selection_phase(payload.log_header),
        reselection_feedback: payload.reselection_feedback || null,
    }
}

/**
 * Detects selection vs reselection from the gateway log_header / selection_trace_id.
 * @param {string|undefined} log_header log header
 * @returns {'selection'|'reselection'}
 */
function detect_selection_phase(log_header)
{
    return String(log_header || '').includes('-reselection-') ? 'reselection' : 'selection'
}

/**
 * Builds one indivisible group from a collect.
 * @param {object} collect collect payload
 * @returns {object}
 */
function build_group(collect)
{
    const items = collect.items || []
    const weight = items.reduce((total, item) => total + item.weight * (item.amount || 1), 0)
    const volume = items.reduce((total, item) =>
    {
        const item_volume = item.volume ?? item.length * item.width * item.height
        return total + item_volume * (item.amount || 1)
    }, 0)
    return {
        id: collect.id,
        items,
        weight,
        volume,
        blacklist: new Set(collect.restrictedToVehicles || []),
    }
}

module.exports = { parse_request }
