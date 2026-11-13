import { Parsed_Vehicle } from '../types/parsed_vehicle'

/**
 * True when exactly one limited type with stock greater than 1 is present.
 * @param vehicles vehicles
 * @returns whether the single-type scaler applies
 */
export function single_type_fleet_applies(vehicles: Parsed_Vehicle[]): boolean
{
    if (vehicles.length !== 1)
    {
        return false
    }
    const vehicle = vehicles[0]
    return !vehicle.unlimited && vehicle.stock !== null && vehicle.stock > 1
}
