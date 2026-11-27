import { Collect_Group } from '../../input/group/collect_group'
import { Chosen_Assignment } from './chosen_assignment'

/**
 * One group that sits on a multi-collect clone and may be moved elsewhere.
 */
export interface Donor_Candidate
{
    entry: Chosen_Assignment
    index: number
    group: Collect_Group
}
