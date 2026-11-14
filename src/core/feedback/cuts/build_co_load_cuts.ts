import { Collect_Group } from '../../input/group/collect_group'
import { sanitize } from '../../solver/model/sanitize'
import { Co_Load_Cut } from './co_load_cut'
import { map_pieces_by_collect } from '../parse/map_pieces_by_collect'

/**
 * Builds LP rows that keep failed co-load collects off the same vehicle type.
 * @param cuts normalized cuts
 * @param groups groups, possibly expanded into item pieces
 * @returns LP rows
 */
export function build_co_load_cuts(cuts: Co_Load_Cut[], groups: Collect_Group[] = []): string[]
{
    const pieces_by_collect = map_pieces_by_collect(groups)
    const rows: string[] = []
    for (const cut of cuts)
    {
        push_cut_rows(rows, cut, pieces_by_collect)
    }
    return rows
}

/**
 * @param rows collected rows
 * @param cut cut
 * @param pieces_by_collect pieces by collect
 */
function push_cut_rows(rows: string[], cut: Co_Load_Cut, pieces_by_collect: Map<string, string[]>): void
{
    const piece_lists = cut.collect_ids
        .map(collect_id => pieces_by_collect.get(collect_id) || [collect_id])
        .filter(list => list.length > 0)
    for (let left = 0; left < piece_lists.length; left++)
    {
        push_pairs(rows, piece_lists, { left, vehicle_id: cut.vehicle_id })
    }
}

/**
 * @param rows collected rows
 * @param piece_lists piece lists
 * @param side left index and vehicle id
 */
function push_pairs(rows: string[], piece_lists: string[][], side: { left: number, vehicle_id: string }): void
{
    for (let right = side.left + 1; right < piece_lists.length; right++)
    {
        const right_ids = piece_lists[right]
        push_piece_pairs(rows, piece_lists[side.left], { right_ids, vehicle_id: side.vehicle_id })
    }
}

/**
 * @param rows collected rows
 * @param left_ids left piece ids
 * @param right right piece ids and vehicle id
 */
function push_piece_pairs(rows: string[], left_ids: string[], right: { right_ids: string[], vehicle_id: string }): void
{
    for (const left_id of left_ids)
    {
        for (const right_id of right.right_ids)
        {
            rows.push(cut_row(rows.length, { left_id, right_id, vehicle_id: right.vehicle_id }))
        }
    }
}

/**
 * @param index row index
 * @param pair group ids and vehicle id
 * @returns LP row
 */
function cut_row(index: number, pair: { left_id: string, right_id: string, vehicle_id: string }): string
{
    const left_var = sanitize(`x_${pair.left_id}_${pair.vehicle_id}`)
    const right_var = sanitize(`x_${pair.right_id}_${pair.vehicle_id}`)
    return `feedback_coload_${index}: ${left_var} + ${right_var} <= 1`
}
