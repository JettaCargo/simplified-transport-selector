import { Selector_Request } from '../types/selector_request'
import { attach_vehicle_capacity } from './attach_vehicle_capacity'
import { build_group } from './build_group'
import { build_parsed_request } from './build_parsed_request'
import { validate_selector_input } from './validate_selector_input'
import { Validated_Collect } from './validated_input'

/**
 * Parses the Java selector request into groups and vehicle types.
 * @param payload raw request body
 * @returns parsed request
 */
export function parse_request(payload: unknown): Selector_Request
{
    const input = validate_selector_input(payload)
    const vehicles = input.vehicles.map(attach_vehicle_capacity)
    const groups = input.collects.filter(collect_has_items).map(build_group)
    return build_parsed_request(input, vehicles, groups)
}

/**
 * @param collect collect
 * @returns whether the collect still has items
 */
function collect_has_items(collect: Validated_Collect): boolean
{
    return collect.items.length > 0
}
