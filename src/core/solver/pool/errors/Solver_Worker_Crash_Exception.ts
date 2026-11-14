import { Message_Tuple } from '../../../messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../../messages/catalog/transport_selector_message'

/**
 * The solver worker exited or failed while running a job.
 * `detail` is for logs only and never goes on the wire.
 */
export class SolverWorkerCrashException extends Error
{
    readonly message_entry: Message_Tuple
    readonly detail: string

    /**
     * @param detail failure description for logs
     */
    constructor(detail: string)
    {
        super(TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH)
        this.name = 'SolverWorkerCrashException'
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH]
        this.detail = detail
    }
}
