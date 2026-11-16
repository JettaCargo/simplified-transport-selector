import { Capacity_Gaps } from '../../scale/capacity/capacity_gaps'
import { Collect_Group } from '../../input/group/collect_group'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { group_fits_vehicle } from '../fit/group_fits_vehicle'
import { Chosen_Assignment } from './chosen_assignment'
import { Donor_Candidate } from './donor_candidate'

/**
 * Peels one group that fits the target vehicle from a multi-collect donor.
 * Prefers lighter groups so large co-loads stay on the heavy truck.
 * @param chosen packed fleet; the donated group is removed from its clone
 * @param target_vehicle empty vehicle type
 * @param gaps capacity gaps
 * @returns the donated group, or undefined when no donor group fits
 */
export function take_fitting_group_from_coloads(
    chosen: Chosen_Assignment[],
    target_vehicle: Parsed_Vehicle,
    gaps: Capacity_Gaps,
): Collect_Group | undefined
{
    const fitting = list_donor_candidates(chosen)
        .filter(candidate => group_fits_vehicle(candidate.group, target_vehicle, gaps))
    if (fitting.length === 0)
    {
        return undefined
    }
    const lightest = fitting.reduce((best, candidate) => (candidate.group.weight < best.group.weight ? candidate : best))
    lightest.entry.groups.splice(lightest.index, 1)
    return lightest.group
}

/**
 * Lists every group on clones that carry at least two groups.
 * @param chosen packed fleet
 * @returns donor candidates in fleet order
 */
function list_donor_candidates(chosen: Chosen_Assignment[]): Donor_Candidate[]
{
    return chosen
        .filter(entry => entry.groups.length > 1)
        .flatMap(entry => entry.groups.map((group, index) => ({ entry, index, group })))
}
