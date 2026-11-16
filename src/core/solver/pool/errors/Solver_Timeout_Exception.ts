import { Message_Tuple } from '../../../messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../../messages/catalog/transport_selector_message'

/**
 * A solve ran past its hard deadline and its worker was terminated.
 */
export class SolverTimeoutException extends Error
{
    readonly message_entry: Message_Tuple

    constructor()
    {
        super(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT)
        this.name = 'SolverTimeoutException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT]
    }
}
