import { NoVehicleForGroupException } from '../solver/No_Vehicle_For_Group_Exception'
import { build_aggregated_model } from '../solver/build_aggregated_model'
import { Aggregated_Model } from '../solver/aggregated_model'
import { Error_Envelope } from '../types/error_envelope'
import { Selector_Request } from '../types/selector_request'
import { error_response } from '../messages/error_response'

/**
 * Builds the MILP, or the no-vehicle catalog error.
 * @param request parsed request
 * @returns model or error envelope
 */
export function build_model(request: Selector_Request): Aggregated_Model | Error_Envelope
{
    try
    {
        return build_aggregated_model(request)
    }
    catch (error)
    {
        if (error instanceof NoVehicleForGroupException)
        {
            return error_response(error.message, [error.group_id])
        }
        throw error
    }
}
