/**
 * Configuration block read from the selector payload.
 */
export interface Selector_Config
{
    enable_minimum_required_vehicles: boolean
    measures_for_transport_choice_heuristics: string[]
    minimum_required_volume: number
    minimum_required_supported_weight: number
    single_waypoint_per_transport: boolean
}
