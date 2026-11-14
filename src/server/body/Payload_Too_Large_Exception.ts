import { Message_Tuple } from '../../core/messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../core/messages/catalog/transport_selector_message'

/**
 * Request body is larger than MAX_BODY_BYTES.
 */
export class PayloadTooLargeException extends Error
{
    readonly message_entry: Message_Tuple

    /**
     * @param max_body_bytes configured limit
     */
    constructor(max_body_bytes: number)
    {
        super(TRANSPORT_SELECTOR_MESSAGE.PAYLOAD_TOO_LARGE)
        this.name = 'PayloadTooLargeException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.PAYLOAD_TOO_LARGE, String(max_body_bytes)]
    }
}
