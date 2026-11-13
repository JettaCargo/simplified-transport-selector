import { Collect_Group } from '../types/collect_group'
import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { Selector_Request } from '../types/selector_request'
import { detect_selection_phase } from './detect_selection_phase'
import { Validated_Input } from './validated_input'

/**
 * Assembles the parsed request consumed by selection.
 * @param input validated payload
 * @param vehicles vehicles with capacity
 * @param groups groups
 * @returns parsed request
 */
export function build_parsed_request(
    input: Validated_Input,
    vehicles: Parsed_Vehicle[],
    groups: Collect_Group[],
): Selector_Request
{
    return {
        groups,
        vehicles,
        gaps: { volume: input.gapVolume, weight: input.gapWeight },
        config: input.config,
        accessories: input.accessories,
        accept_divided_collect: Boolean(input.acceptDividedCollect),
        first_criteria: input.first_criteria,
        second_criteria: input.second_criteria,
        log_header: input.log_header,
        selection_phase: detect_selection_phase(input.log_header),
        reselection_feedback: input.reselection_feedback || null,
    }
}
