import { Parsed_Vehicle } from '../types/parsed_vehicle'
import { vehicle_volume } from '../scale/vehicle_volume'
import { Validated_Vehicle } from './validated_input'

/**
 * Attaches geometric volume and limited stock to a vehicle.
 * @param vehicle validated vehicle
 * @returns vehicle with capacity
 */
export function attach_vehicle_capacity(vehicle: Validated_Vehicle): Parsed_Vehicle
{
    return {
        id: vehicle.id,
        name: vehicle.name,
        supported_weight: vehicle.supported_weight,
        amount: vehicle.amount,
        unlimited: vehicle.unlimited,
        cost: vehicle.cost,
        containers: vehicle.containers || [],
        volume: vehicle_volume(vehicle),
        stock: vehicle.unlimited ? null : Number(vehicle.amount),
    }
}
