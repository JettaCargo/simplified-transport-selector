const { sanitize } = require('./build_aggregated_model')

/**
 * Reads HiGHS columns into type counts and group→type assignments.
 * @param {object} result HiGHS result
 * @param {object[]} groups groups
 * @param {object[]} vehicles vehicles
 * @returns {{counts: Map<string, number>, assignment: Map<string, string>}}
 */
function read_solution(result, groups, vehicles)
{
    const columns = result.Columns || {}
    const counts = new Map()
    const assignment = new Map()

    for (const vehicle of vehicles)
    {
        const name = sanitize(`n_${vehicle.id}`)
        const column = columns[name]
        const value = column ? Math.round(column.Primal || 0) : 0
        counts.set(vehicle.id, value)
    }

    for (const group of groups)
    {
        for (const vehicle of vehicles)
        {
            const name = sanitize(`x_${group.id}_${vehicle.id}`)
            const column = columns[name]
            if (column && (column.Primal || 0) > 0.5)
            {
                assignment.set(group.id, vehicle.id)
                break
            }
        }
    }

    return { counts, assignment }
}

module.exports = { read_solution }
