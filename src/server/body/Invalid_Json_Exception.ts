import { Message_Tuple } from '../../core/messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../core/messages/catalog/transport_selector_message'

/**
 * Request body was not valid JSON.
 */
export class InvalidJsonException extends Error
{
    readonly message_entry: Message_Tuple

    constructor()
    {
        super(TRANSPORT_SELECTOR_MESSAGE.INVALID_JSON)
        this.name = 'InvalidJsonException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.INVALID_JSON]
    }
}
