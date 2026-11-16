import { Capacity_Gaps } from '../../scale/capacity/capacity_gaps'
import { Chosen_Assignment } from './chosen_assignment'
import { take_fitting_group_from_coloads } from './take_fitting_group_from_coloads'

/**
 * Moves co-loaded groups onto empty vehicle clones that can carry them alone.
 * Drops slots that stay empty so the response never emits collects:[].
 * @param chosen packed fleet; empty clones receive groups in place
 * @param gaps capacity gaps
 * @returns clones that carry at least one group
 */
export function rebind_empty_vehicle_slots(chosen: Chosen_Assignment[], gaps: Capacity_Gaps): Chosen_Assignment[]
{
    for (const empty_entry of chosen)
    {
        if (empty_entry.groups.length > 0)
        {
            continue
        }
        const moved = take_fitting_group_from_coloads(chosen, empty_entry.vehicle, gaps)
        if (moved)
        {
            empty_entry.groups.push(moved)
        }
    }
    return chosen.filter(entry => entry.groups.length > 0)
}
