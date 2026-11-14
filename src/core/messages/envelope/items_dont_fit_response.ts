import { Error_Envelope } from './error_envelope'
import { error_response } from './error_response'
import { TRANSPORT_SELECTOR_MESSAGE } from '../catalog/transport_selector_message'

/**
 * Reports collects that fit no vehicle.
 * @param collect_ids comma-separated collect ids
 * @returns error envelope
 */
export function items_dont_fit_response(collect_ids: string): Error_Envelope
{
    return error_response(TRANSPORT_SELECTOR_MESSAGE.ITEMS_DONT_FIT, [collect_ids])
}
