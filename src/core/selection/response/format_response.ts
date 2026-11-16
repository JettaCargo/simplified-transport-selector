import { Chosen_Assignment } from '../fleet/chosen_assignment'
import { clone_vehicle_json, Response_Vehicle } from '../fleet/clone_vehicle_json'
import { unique_group_ids } from '../groups/unique_group_ids'

/**
 * Successful selector body.
 */
export interface Selector_Success
{
    vehicles_array: Array<{
        vehicle: Response_Vehicle
        collects: Array<{ id: string }>
    }>
}

/**
 * Formats chosen vehicle clones into the Java selector response shape.
 * @param chosen chosen clones
 * @returns vehicles_array response
 */
export function format_response(chosen: Chosen_Assignment[]): Selector_Success
{
    return {
        vehicles_array: chosen.map(entry => ({
            vehicle: clone_vehicle_json(entry.vehicle),
            collects: unique_group_ids(entry.groups).map(id => ({ id })),
        })),
    }
}
