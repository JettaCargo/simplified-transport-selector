import { Error_Envelope } from '../types/error_envelope'
import { Collect_Group } from '../types/collect_group'
import { Selector_Request } from '../types/selector_request'
import { expand_divisible_groups } from './expand_divisible_groups'
import { groups_without_vehicle } from './groups_without_vehicle'
import { items_dont_fit_response } from '../messages/items_dont_fit_response'

/**
 * Expands divisible groups and rejects groups that still fit no vehicle.
 * @param request parsed request
 * @returns the request, or a fit error
 */
export function prepare_groups(request: Selector_Request): Selector_Request | Error_Envelope
{
    request.groups = expand_divisible_groups(request.groups, request.vehicles, request.gaps)
    const impossible = groups_without_vehicle(request.groups, request.vehicles, request.gaps)
    if (impossible.length > 0)
    {
        return items_dont_fit_response(impossible.map(collect_id).join(','))
    }
    return request
}

/**
 * @param group group
 * @returns collect id
 */
function collect_id(group: Collect_Group): string
{
    return group.parent_id || group.id
}
