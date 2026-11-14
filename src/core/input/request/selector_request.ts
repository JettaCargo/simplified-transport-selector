import { Capacity_Gaps } from '../../scale/capacity/capacity_gaps'
import { Cargo_Item } from '../group/cargo_item'
import { Collect_Group } from '../group/collect_group'
import { Parsed_Vehicle } from '../vehicle/parsed_vehicle'
import { Selector_Config } from './selector_config'

/**
 * Parsed selector request used by the MILP and the stock-1 shortcut.
 */
export interface Selector_Request
{
    groups: Collect_Group[]
    vehicles: Parsed_Vehicle[]
    gaps: Capacity_Gaps
    config: Selector_Config
    accessories: Cargo_Item[]
    accept_divided_collect: boolean
    first_criteria: string
    second_criteria: string
    log_header: string
    selection_phase: 'selection' | 'reselection'
    reselection_feedback: unknown
}
