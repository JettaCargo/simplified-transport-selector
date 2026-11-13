import { Validated_Vehicle } from './validated_input'
import { Vehicle_Container } from '../types/vehicle_container'

/**
 * Builds the single container JSONFactory creates from the vehicle itself.
 * @param vehicle vehicle used as its own container
 * @returns container
 */
export function container_from_vehicle(vehicle: Validated_Vehicle): Vehicle_Container
{
    return {
        id: vehicle.id,
        name: vehicle.name,
        supported_weight: vehicle.supported_weight,
        width: vehicle.width ?? 0,
        length: vehicle.length ?? 0,
        height: vehicle.height ?? 0,
        sequencia: vehicle.sequencia ?? 1,
    }
}
