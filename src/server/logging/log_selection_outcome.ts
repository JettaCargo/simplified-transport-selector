import { Error_Envelope } from '../../core/messages/envelope/error_envelope'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../core/messages/catalog/transport_selector_message'
import { SelectionMetrics } from '../../core/selection/metrics/Selection_Metrics'
import { SolverWorkerCrashException } from '../../core/solver/pool/errors/Solver_Worker_Crash_Exception'
import { selection_outcome_logger } from './selection_outcome_logger'

const SUCCESS_OUTCOME = 'success'

/**
 * What a request ended with.
 */
export interface Selection_Outcome
{
    body: object
    error?: unknown
    started_at: number
}

/**
 * Writes one structured line per request, plus an error line with the raw
 * cause for internal errors and worker crashes. Never logs payload contents.
 * @param metrics per-request facts
 * @param outcome response body, thrown error, and start time
 */
export function log_selection_outcome(metrics: SelectionMetrics, outcome: Selection_Outcome): void
{
    const outcome_key = outcome_key_of(outcome.body)
    const total_milliseconds = Date.now() - outcome.started_at
    selection_outcome_logger().log(JSON.stringify({ event: 'transport_selection', ...metrics, outcome_key, total_milliseconds }))
    const detail = failure_detail(outcome_key, outcome.error)
    if (detail)
    {
        selection_outcome_logger().error(JSON.stringify({ event: 'transport_selection_failure', log_header: metrics.log_header, outcome_key, detail }))
    }
}

/**
 * @param body response body
 * @returns first catalog key of an error envelope, or success
 */
function outcome_key_of(body: object): string
{
    const errors = (body as Partial<Error_Envelope>).messages?.errors
    return errors?.[0]?.[0] ?? SUCCESS_OUTCOME
}

/**
 * @param outcome_key catalog key of the response
 * @param error thrown value
 * @returns raw cause worth an error line, if any
 */
function failure_detail(outcome_key: string, error: unknown): string | undefined
{
    if (error instanceof SolverWorkerCrashException)
    {
        return error.detail
    }
    if (outcome_key !== TRANSPORT_SELECTOR_MESSAGE.INTERNAL_ERROR)
    {
        return undefined
    }
    return error instanceof Error ? error.stack || error.message : String(error)
}
