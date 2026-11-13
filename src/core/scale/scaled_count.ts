/**
 * After LP chooses N of one limited type, emit min(3N, stock).
 * @param lp_chosen_count LP count
 * @param fleet_amount limited stock
 * @returns scaled count
 */
export function scaled_count(lp_chosen_count: number, fleet_amount: number): number
{
    return Math.min(lp_chosen_count * 3, fleet_amount)
}
