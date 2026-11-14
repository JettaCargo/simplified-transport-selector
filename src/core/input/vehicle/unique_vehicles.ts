import { Validated_Vehicle } from '../validation/validated_input'
import { with_container_fallback } from './with_container_fallback'

/**
 * Keeps the first vehicle for each id and fills a missing container list.
 * @param vehicles vehicles
 * @returns unique vehicles
 */
export function unique_vehicles(vehicles: Validated_Vehicle[]): Validated_Vehicle[]
{
    const seen = new Set<string>()
    const unique: Validated_Vehicle[] = []
    for (const vehicle of vehicles)
    {
        if (seen.has(vehicle.id))
        {
            continue
        }
        seen.add(vehicle.id)
        unique.push(with_container_fallback(vehicle))
    }
    return unique
}
