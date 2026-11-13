import { le } from '@jetta/number-compare'
import { Cargo_Item } from '../types/cargo_item'
import { Vehicle_Container } from '../types/vehicle_container'
import { item_orientations } from './item_orientations'

/**
 * Tries declared orientations against every container.
 * @param item item
 * @param containers containers
 * @returns whether one orientation fits one container
 */
export function item_fits_any_container(item: Cargo_Item, containers: Vehicle_Container[]): boolean
{
    const orientations = item_orientations(item)
    return containers.some(container => orientations.some(orientation => orientation_fits(orientation, container)))
}

/**
 * @param orientation length, width, height
 * @param container container
 * @returns whether the orientation fits
 */
function orientation_fits(orientation: number[], container: Vehicle_Container): boolean
{
    const [length, width, height] = orientation
    return le(length, container.length) && le(width, container.width) && le(height, container.height)
}
