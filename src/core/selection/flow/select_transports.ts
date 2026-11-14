import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { append_single_limited_transport } from '../single_limited/append_single_limited_transport'
import { parse_request } from '../../input/request/parse_request'
import { SELECTION_PATH } from '../metrics/selection_path'
import { prepare_groups } from './prepare_groups'
import { Selector_Success } from '../response/format_response'
import { Selection_Options } from './selection_options'
import { solve_selection } from './solve_selection'

/**
 * Selects transports with a type-level MILP plus bin packing.
 * A single limited vehicle with stock 1 skips the solver and takes every collect.
 * @param payload Java selector request body
 * @param options abort signal and metrics recorder of the caller
 * @returns vehicles_array response or error payload
 */
export async function select_transports(payload: unknown, options: Selection_Options = {}): Promise<Selector_Success | Error_Envelope>
{
    const request = parse_request(payload)
    options.metrics?.describe_request(request)
    const appended = append_single_limited_transport(request)
    if (appended)
    {
        options.metrics?.record_path(SELECTION_PATH.SINGLE_LIMITED)
        return appended
    }
    const prepared = prepare_groups(request)
    if ('apiError' in prepared)
    {
        return prepared
    }
    options.metrics?.record_path(SELECTION_PATH.SOLVER)
    return solve_selection(prepared, options)
}
