import { SelectorInputException } from '../validation/Selector_Input_Exception'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { container_from_vehicle } from './container_from_vehicle'
import { Validated_Vehicle } from '../validation/validated_input'

/**
 * Uses the vehicle itself as its container when containers is absent.
 * @param vehicle vehicle
 * @returns vehicle with a container list
 */
export function with_container_fallback(vehicle: Validated_Vehicle): Validated_Vehicle
{
    if (Array.isArray(vehicle.containers))
    {
        return vehicle
    }
    if (vehicle.width == null || vehicle.length == null || vehicle.height == null)
    {
        throw new SelectorInputException(TRANSPORT_SELECTOR_MESSAGE.MISSING_CONTAINER, [vehicle.id])
    }
    return {
        ...vehicle,
        containers: [container_from_vehicle(vehicle)],
    }
}
