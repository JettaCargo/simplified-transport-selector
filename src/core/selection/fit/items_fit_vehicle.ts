import { gt } from '@jetta/number-compare'
import { Cargo_Item } from '../../input/group/cargo_item'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { item_fits_any_container } from './item_fits_any_container'

/**
 * Checks item geometry and weight against the vehicle containers.
 * @param items items
 * @param vehicle vehicle
 * @returns whether every item fits
 */
export function items_fit_vehicle(items: Cargo_Item[], vehicle: Parsed_Vehicle): boolean
{
    const containers = vehicle.containers || []
    if (containers.length === 0)
    {
        return false
    }
    return items.every(item => item_fits_vehicle(item, vehicle, containers))
}

/**
 * @param item item
 * @param vehicle vehicle
 * @param containers containers
 * @returns whether the item fits
 */
function item_fits_vehicle(item: Cargo_Item, vehicle: Parsed_Vehicle, containers: Parsed_Vehicle['containers']): boolean
{
    const amount = item.amount || 1
    if (gt(item.weight * amount, vehicle.supported_weight))
    {
        return false
    }
    return item_fits_any_container(item, containers)
}
