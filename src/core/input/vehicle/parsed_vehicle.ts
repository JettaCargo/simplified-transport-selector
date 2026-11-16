import { Vehicle_Container } from './vehicle_container'

/**
 * Vehicle type after capacity is attached.
 */
export interface Parsed_Vehicle
{
    id: string
    name: string
    supported_weight: number
    amount: number
    unlimited: boolean
    cost: number
    containers: Vehicle_Container[]
    volume: number
    stock: number | null
}
