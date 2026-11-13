import { gt } from '@jetta/number-compare'
import { supported_weight_with_gap } from '../scale/supported_weight_with_gap'
import { volume_with_gap } from '../scale/volume_with_gap'
import { group_fits_vehicle } from '../selection/group_fits_vehicle'
import { Capacity_Gaps } from '../types/capacity_gaps'
import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { sanitize } from './sanitize'

/**
 * Adds weight, volume, and large-group rows for one vehicle type.
 * @param vehicle vehicle
 * @param groups groups
 * @param target gaps and the constraint list
 */
export function add_capacity_rows(
    vehicle: Parsed_Vehicle,
    groups: Collect_Group[],
    target: { gaps: Capacity_Gaps, constraints: string[] },
): void
{
    const count_name = sanitize(`n_${vehicle.id}`)
    const weight_cap = supported_weight_with_gap(vehicle, target.gaps.weight)
    const volume_cap = volume_with_gap(vehicle, target.gaps.volume)
    const limits = { gaps: target.gaps, weight_cap, volume_cap }
    const rows = capacity_terms(vehicle, groups, limits)
    push_row(target.constraints, `w_${sanitize(vehicle.id)}`, { terms: rows.weight, capacity: weight_cap, count_name })
    push_row(target.constraints, `v_${sanitize(vehicle.id)}`, { terms: rows.volume, capacity: volume_cap, count_name })
    if (rows.large.length)
    {
        target.constraints.push(`large_${sanitize(vehicle.id)}: ${rows.large.join(' + ')} - ${count_name} <= 0`)
    }
}

/**
 * @param constraints constraints
 * @param name row name
 * @param row terms, capacity, and the count variable
 */
function push_row(
    constraints: string[],
    name: string,
    row: { terms: string[], capacity: number, count_name: string },
): void
{
    if (row.terms.length === 0)
    {
        return
    }
    constraints.push(`${name}: ${row.terms.join(' + ')} - ${row.capacity} ${row.count_name} <= 0`)
}

/**
 * @param vehicle vehicle
 * @param groups groups
 * @param limits gaps and one-vehicle capacities
 * @returns row terms
 */
function capacity_terms(
    vehicle: Parsed_Vehicle,
    groups: Collect_Group[],
    limits: { gaps: Capacity_Gaps, weight_cap: number, volume_cap: number },
): { weight: string[], volume: string[], large: string[] }
{
    const weight: string[] = []
    const volume: string[] = []
    const large: string[] = []
    for (const group of groups)
    {
        push_group_terms({ weight, volume, large }, { group, vehicle, ...limits })
    }
    return { weight, volume, large }
}

/**
 * @param terms collected terms
 * @param slot group, vehicle, and capacities
 */
function push_group_terms(
    terms: { weight: string[], volume: string[], large: string[] },
    slot: {
        group: Collect_Group
        vehicle: Parsed_Vehicle
        gaps: Capacity_Gaps
        weight_cap: number
        volume_cap: number
    },
): void
{
    if (!group_fits_vehicle(slot.group, slot.vehicle, slot.gaps))
    {
        return
    }
    const name = sanitize(`x_${slot.group.id}_${slot.vehicle.id}`)
    terms.weight.push(`${slot.group.weight} ${name}`)
    terms.volume.push(`${slot.group.volume} ${name}`)
    if (gt(slot.group.weight, slot.weight_cap * 0.5) || gt(slot.group.volume, slot.volume_cap * 0.5))
    {
        terms.large.push(name)
    }
}
