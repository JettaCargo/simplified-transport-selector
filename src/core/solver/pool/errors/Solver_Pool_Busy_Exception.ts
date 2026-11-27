import { Message_Tuple } from '../../../messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../../messages/catalog/transport_selector_message'

/**
 * Every solver worker is busy and the queue is full, or the pool is closing.
 */
export class SolverPoolBusyException extends Error
{
    readonly message_entry: Message_Tuple

    constructor()
    {
        super(TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY)
        this.name = 'SolverPoolBusyException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY]
    }
}
