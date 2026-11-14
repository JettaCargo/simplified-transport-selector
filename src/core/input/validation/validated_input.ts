import { Cargo_Item } from '../group/cargo_item'
import { Selector_Config } from '../request/selector_config'
import { Vehicle_Container } from '../vehicle/vehicle_container'

/**
 * Vehicle as returned by the schema, before capacity is attached.
 */
export interface Validated_Vehicle
{
    id: string
    name: string
    supported_weight: number
    amount: number
    unlimited: boolean
    cost: number
    containers?: Vehicle_Container[]
    width?: number
    length?: number
    height?: number
    sequencia?: number
}

/**
 * Collect as returned by the schema.
 */
export interface Validated_Collect
{
    id: string
    restrictedToVehicles: string[]
    items: Cargo_Item[]
}

/**
 * Payload after Zod defaults, before unique-vehicle and amount filters.
 */
export interface Validated_Input
{
    vehicles: Validated_Vehicle[]
    collects: Validated_Collect[]
    config: Selector_Config
    gapWeight: number
    gapVolume: number
    first_criteria: string
    second_criteria: string
    log_header: string
    accessories: Cargo_Item[]
    acceptDividedCollect?: unknown
    reselection_feedback?: unknown
}
