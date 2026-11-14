import { Message_Tuple } from '../../../messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../../messages/catalog/transport_selector_message'

/**
 * The caller gave up on the request (client disconnected) before the solve finished.
 */
export class RequestAbortedException extends Error
{
    readonly message_entry: Message_Tuple

    constructor()
    {
        super(TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED)
        this.name = 'RequestAbortedException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED]
    }
}
