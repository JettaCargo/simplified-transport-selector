import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * Supported weight with gap applied the same way as CollectionsUtils.
 * @param vehicle vehicle
 * @param gap_weight gap fraction
 * @returns supported weight
 */
export function supported_weight_with_gap(vehicle: Parsed_Vehicle, gap_weight: number): number
{
    const raw = vehicle.supported_weight - vehicle.supported_weight * gap_weight
    return Number(raw.toFixed(7))
}
