import { Validated_Vehicle } from '../../input/validation/validated_input'
import { Vehicle_Container } from '../../input/vehicle/vehicle_container'

/**
 * Sums container volumes of a vehicle.
 * @param vehicle vehicle with containers
 * @returns volume
 */
export function vehicle_volume(vehicle: Validated_Vehicle | { containers?: Vehicle_Container[] }): number
{
    return (vehicle.containers || []).reduce(add_container_volume, 0)
}

/**
 * @param total running total
 * @param container container
 * @returns next total
 */
function add_container_volume(total: number, container: Vehicle_Container): number
{
    return total + container.length * container.width * container.height
}
