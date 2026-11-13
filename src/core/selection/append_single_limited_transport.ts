import { Selector_Request } from '../types/selector_request'
import { format_response, Selector_Success } from './format_response'
import { single_stock_vehicle } from './single_stock_vehicle'

/**
 * Binds every collect to the only limited vehicle when its stock is 1.
 * Skips volume, weight, geometry, and vehicle-restriction checks.
 * @param request parsed selector request
 * @returns selector response, or undefined when the shortcut does not apply
 */
export function append_single_limited_transport(request: Selector_Request): Selector_Success | undefined
{
    const vehicle = single_stock_vehicle(request.vehicles)
    if (!vehicle)
    {
        return undefined
    }
    return format_response([{ vehicle, groups: request.groups }])
}
