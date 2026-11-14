import { Error_Envelope } from '../../core/messages/envelope/error_envelope'
import { Message_Tuple } from '../../core/messages/envelope/message_tuple'
import { error_response } from '../../core/messages/envelope/error_response'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../core/messages/catalog/transport_selector_message'

/**
 * Maps a thrown error to the catalog envelope. Errors outside the catalog
 * become the internal-error key with no parameters, so raw text never reaches the wire.
 * @param error thrown value
 * @returns error envelope
 */
export function error_response_from_unknown(error: unknown): Error_Envelope
{
    if (has_message_entry(error))
    {
        return error_response(error.message_entry[0], error.message_entry.slice(1))
    }
    return error_response(TRANSPORT_SELECTOR_MESSAGE.INTERNAL_ERROR)
}

/**
 * @param error thrown value
 * @returns whether the error carries a catalog tuple
 */
function has_message_entry(error: unknown): error is { message_entry: Message_Tuple }
{
    if (!error || typeof error !== 'object' || !('message_entry' in error))
    {
        return false
    }
    const entry = (error as { message_entry?: unknown }).message_entry
    return Array.isArray(entry) && typeof entry[0] === 'string'
}
