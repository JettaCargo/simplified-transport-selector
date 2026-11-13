import { Error_Envelope } from '../types/error_envelope'
import { append_single_limited_transport } from './append_single_limited_transport'
import { parse_request } from '../input/parse_request'
import { prepare_groups } from './prepare_groups'
import { Selector_Success } from './format_response'
import { solve_selection } from './solve_selection'

/**
 * Selects transports with a type-level MILP plus bin packing.
 * A single limited vehicle with stock 1 skips the solver and takes every collect.
 * @param payload Java selector request body
 * @returns vehicles_array response or error payload
 */
export async function select_transports(payload: unknown): Promise<Selector_Success | Error_Envelope>
{
    const request = parse_request(payload)
    const appended = append_single_limited_transport(request)
    if (appended)
    {
        return appended
    }
    const prepared = prepare_groups(request)
    if ('apiError' in prepared)
    {
        return prepared
    }
    return solve_selection(prepared)
}
