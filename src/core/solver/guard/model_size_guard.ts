import { error_response } from '../../messages/envelope/error_response'
import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { Selector_Request } from '../../input/request/selector_request'
import { Aggregated_Model } from '../model/aggregated_model'
import { Model_Size_Limits } from './model_size_limits'

/**
 * Checks the group-to-type assignment columns before the model is built.
 * @param request parsed request
 * @param limits model size limits
 * @returns the too-large envelope, or undefined when the request is within limits
 */
export function oversized_assignment(request: Selector_Request, limits: Model_Size_Limits): Error_Envelope | undefined
{
    const columns = request.groups.length * request.vehicles.length
    return exceeded('assignment_columns', columns, limits.max_assignment_columns)
}

/**
 * Checks the constraint rows of a built model before it is solved.
 * @param model built model
 * @param limits model size limits
 * @returns the too-large envelope, or undefined when the model is within limits
 */
export function oversized_model(model: Aggregated_Model, limits: Model_Size_Limits): Error_Envelope | undefined
{
    return exceeded('model_rows', model.constraints.length, limits.max_model_rows)
}

/**
 * @param dimension measured dimension
 * @param size measured size
 * @param limit allowed size
 * @returns the too-large envelope, or undefined within the limit
 */
function exceeded(dimension: string, size: number, limit: number): Error_Envelope | undefined
{
    if (size <= limit)
    {
        return undefined
    }
    return error_response(TRANSPORT_SELECTOR_MESSAGE.MODEL_TOO_LARGE, [dimension, String(size), String(limit)])
}
