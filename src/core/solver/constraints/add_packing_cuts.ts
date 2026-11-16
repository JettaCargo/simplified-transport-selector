import { sanitize } from '../model/sanitize'
import { Packing_Cut } from './packing_cut'

/**
 * Forbids each unpackable assignment: at least one of its groups must leave the type.
 * @param constraints constraints
 * @param cuts unpackable assignments from earlier rounds
 */
export function add_packing_cuts(constraints: string[], cuts: Packing_Cut[]): void
{
    cuts.forEach((cut, index) => constraints.push(packing_cut_row(cut, index)))
}

/**
 * @param cut unpackable assignment
 * @param index row index
 * @returns LP row
 */
function packing_cut_row(cut: Packing_Cut, index: number): string
{
    const terms = cut.group_ids.map(group_id => sanitize(`x_${group_id}_${cut.vehicle_id}`))
    return `packing_cut_${index}: ${terms.join(' + ')} <= ${cut.group_ids.length - 1}`
}
