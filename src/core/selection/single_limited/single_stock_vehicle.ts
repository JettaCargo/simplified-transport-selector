import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * Returns the only vehicle when it is limited and its stock is exactly 1.
 * @param vehicles parsed vehicles
 * @returns that vehicle, or undefined
 */
export function single_stock_vehicle(vehicles: Parsed_Vehicle[] | undefined): Parsed_Vehicle | undefined
{
    if (!Array.isArray(vehicles) || vehicles.length !== 1)
    {
        return undefined
    }
    const vehicle = vehicles[0]
    if (vehicle.unlimited || vehicle.stock !== 1)
    {
        return undefined
    }
    return vehicle
}
