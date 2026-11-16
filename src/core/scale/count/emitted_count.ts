import { scaled_count } from './scaled_count'

/**
 * Emits the scaled fleet size, or the whole stock when the LP chose nothing.
 * @param lp_chosen_count LP count
 * @param fleet_amount limited stock
 * @returns emitted count
 */
export function emitted_count(lp_chosen_count: number, fleet_amount: number): number
{
    if (lp_chosen_count < 1)
    {
        return fleet_amount
    }
    return scaled_count(lp_chosen_count, fleet_amount)
}
