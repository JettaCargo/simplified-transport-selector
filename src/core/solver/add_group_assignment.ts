import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { group_fits_vehicle } from '../selection/group_fits_vehicle'
import { Model_Context } from './model_context'
import { NoVehicleForGroupException } from './No_Vehicle_For_Group_Exception'
import { sanitize } from './sanitize'

/**
 * Adds the assignment row that places one group on exactly one feasible type.
 * @param group group
 * @param context model pieces
 * @param gaps gaps
 */
export function add_group_assignment(group: Collect_Group, context: Model_Context, gaps: Capacity_Gaps): void
{
    const terms = assignment_terms(group, context, gaps)
    if (terms.length === 0)
    {
        throw new NoVehicleForGroupException(group.id)
    }
    context.constraints.push(`assign_${sanitize(group.id)}: ${terms.join(' + ')} = 1`)
}

/**
 * @param group group
 * @param context model pieces
 * @param gaps gaps
 * @returns assignment variable names that fit
 */
function assignment_terms(group: Collect_Group, context: Model_Context, gaps: Capacity_Gaps): string[]
{
    const terms: string[] = []
    for (const vehicle of context.vehicles)
    {
        push_fit_term(terms, group, { vehicle, gaps, context })
    }
    return terms
}

/**
 * @param terms collected names
 * @param group group
 * @param fit vehicle, gaps, and model pieces
 */
function push_fit_term(
    terms: string[],
    group: Collect_Group,
    fit: { vehicle: Parsed_Vehicle, gaps: Capacity_Gaps, context: Model_Context },
): void
{
    if (!group_fits_vehicle(group, fit.vehicle, fit.gaps))
    {
        return
    }
    const name = sanitize(`x_${group.id}_${fit.vehicle.id}`)
    fit.context.assignment_keys.push(name)
    fit.context.binaries.push(name)
    terms.push(name)
    fit.context.objective.push(`0.001 ${name}`)
}
