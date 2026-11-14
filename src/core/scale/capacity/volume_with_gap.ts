import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * Volume with gap applied the same way as CollectionsUtils.
 * @param vehicle vehicle
 * @param gap_volume gap fraction
 * @returns volume
 */
export function volume_with_gap(vehicle: Parsed_Vehicle, gap_volume: number): number
{
    return vehicle.volume - vehicle.volume * gap_volume
}
