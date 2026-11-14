/**
 * Process surface the handlers attach to.
 */
interface Process_Target
{
    on: (event: 'uncaughtException' | 'unhandledRejection', listener: (reason: unknown) => void) => unknown
    exit: (code: number) => void
}

/**
 * Logger surface the handlers write to.
 */
interface Error_Logger
{
    error: (...args: unknown[]) => void
}

/**
 * Logs and exits non-zero on an uncaught exception or unhandled rejection,
 * so Kubernetes restarts a process whose state can no longer be trusted.
 * @param target process
 * @param logger error logger
 */
export function install_process_error_handlers(target: Process_Target, logger: Error_Logger): void
{
    target.on('uncaughtException', reason => exit_after_logging(target, logger, ['uncaught exception', reason]))
    target.on('unhandledRejection', reason => exit_after_logging(target, logger, ['unhandled rejection', reason]))
}

/**
 * @param target process
 * @param logger error logger
 * @param failure failure kind and reason
 */
function exit_after_logging(target: Process_Target, logger: Error_Logger, failure: [string, unknown]): void
{
    const [kind, reason] = failure
    const detail = reason instanceof Error ? reason.stack || reason.message : String(reason)
    logger.error(`transport-selector ${kind}, exiting: ${detail}`)
    target.exit(1)
}
