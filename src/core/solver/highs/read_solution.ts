import { gt } from '@jetta/number-compare'
import { Collect_Group } from '../../input/group/collect_group'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { Highs_Result } from './highs_result'
import { sanitize } from '../model/sanitize'

/**
 * Type counts and group-to-type assignments read from HiGHS.
 */
export interface Solver_Solution
{
    counts: Map<string, number>
    assignment: Map<string, string>
}

/**
 * Reads HiGHS columns into type counts and group assignments.
 * @param result HiGHS result
 * @param groups groups
 * @param vehicles vehicles
 * @returns counts and assignments
 */
export function read_solution(result: Highs_Result, groups: Collect_Group[], vehicles: Parsed_Vehicle[]): Solver_Solution
{
    const columns = result.Columns || {}
    return {
        counts: read_counts(columns, vehicles),
        assignment: read_assignments(columns, groups, vehicles),
    }
}

/**
 * @param columns HiGHS columns
 * @param vehicles vehicles
 * @returns count by vehicle id
 */
function read_counts(columns: Record<string, { Primal?: number }>, vehicles: Parsed_Vehicle[]): Map<string, number>
{
    const counts = new Map<string, number>()
    for (const vehicle of vehicles)
    {
        counts.set(vehicle.id, Math.round(columns[sanitize(`n_${vehicle.id}`)]?.Primal || 0))
    }
    return counts
}

/**
 * @param columns HiGHS columns
 * @param groups groups
 * @param vehicles vehicles
 * @returns vehicle id by group id
 */
function read_assignments(
    columns: Record<string, { Primal?: number }>,
    groups: Collect_Group[],
    vehicles: Parsed_Vehicle[],
): Map<string, string>
{
    const assignment = new Map<string, string>()
    for (const group of groups)
    {
        assign_group(assignment, columns, { group, vehicles })
    }
    return assignment
}

/**
 * @param assignment assignment map
 * @param columns HiGHS columns
 * @param target group and vehicles
 */
function assign_group(
    assignment: Map<string, string>,
    columns: Record<string, { Primal?: number }>,
    target: { group: Collect_Group, vehicles: Parsed_Vehicle[] },
): void
{
    for (const vehicle of target.vehicles)
    {
        const column = columns[sanitize(`x_${target.group.id}_${vehicle.id}`)]
        if (column && gt(column.Primal || 0, 0.5))
        {
            assignment.set(target.group.id, vehicle.id)
            return
        }
    }
}
