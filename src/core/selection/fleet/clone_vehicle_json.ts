import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'

/**
 * Vehicle object in the Java selector response.
 */
export interface Response_Vehicle
{
    id: string
    name: string
    amount: number
    unlimited: boolean
    cost: number
    supported_weight: number
    containers: Parsed_Vehicle['containers']
}

/**
 * Copies the vehicle fields the Java response keeps, with amount 1.
 * @param vehicle vehicle type
 * @returns response vehicle
 */
export function clone_vehicle_json(vehicle: Parsed_Vehicle): Response_Vehicle
{
    return {
        id: vehicle.id,
        name: vehicle.name,
        amount: 1,
        unlimited: vehicle.unlimited,
        cost: vehicle.cost,
        supported_weight: vehicle.supported_weight,
        containers: vehicle.containers,
    }
}
