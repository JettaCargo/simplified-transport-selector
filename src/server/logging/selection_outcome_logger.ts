import { Logger } from '@jetta/logger'

/**
 * Logger surface the outcome log writes to.
 */
export interface Selection_Outcome_Logger
{
    log: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
}

let current_logger: Selection_Outcome_Logger | undefined

/**
 * @returns the logger for per-request outcome lines
 */
export function selection_outcome_logger(): Selection_Outcome_Logger
{
    current_logger = current_logger || Logger.system_logger('transport-selector')
    return current_logger
}

/**
 * Replaces the outcome logger (tests capture lines this way).
 * @param logger logger to use from now on
 */
export function use_selection_outcome_logger(logger: Selection_Outcome_Logger): void
{
    current_logger = logger
}
