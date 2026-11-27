import { Packing_Cut } from '../../solver/constraints/packing_cut'
import { NoVehicleForGroupException } from '../../solver/errors/No_Vehicle_For_Group_Exception'
import { oversized_assignment, oversized_model } from '../../solver/guard/model_size_guard'
import { read_model_size_limits } from '../../solver/guard/model_size_limits'
import { build_aggregated_model } from '../../solver/model/build_aggregated_model'
import { Aggregated_Model } from '../../solver/model/aggregated_model'
import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { Selector_Request } from '../../input/request/selector_request'
import { error_response } from '../../messages/envelope/error_response'

/**
 * Builds the MILP within the model size limits, or returns the catalog error.
 * @param request parsed request
 * @param packing_cuts unpackable assignments to forbid
 * @returns model or error envelope
 */
export function build_model(request: Selector_Request, packing_cuts: Packing_Cut[] = []): Aggregated_Model | Error_Envelope
{
    const limits = read_model_size_limits(process.env)
    const too_many_columns = oversized_assignment(request, limits)
    if (too_many_columns)
    {
        return too_many_columns
    }
    const model = build_or_report(request, packing_cuts)
    if ('apiError' in model)
    {
        return model
    }
    return oversized_model(model, limits) || model
}

/**
 * @param request parsed request
 * @param packing_cuts unpackable assignments to forbid
 * @returns model or the no-vehicle catalog error
 */
function build_or_report(request: Selector_Request, packing_cuts: Packing_Cut[]): Aggregated_Model | Error_Envelope
{
    try
    {
        return build_aggregated_model(request, packing_cuts)
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
