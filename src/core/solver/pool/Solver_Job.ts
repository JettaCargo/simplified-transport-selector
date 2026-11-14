import { Highs_Result } from '../highs/highs_result'
import { Solve_Options } from './solve_options'

/**
 * One LP waiting for, or running on, a solver worker. Settles exactly once
 * and then reports its queue wait and solve time.
 */
export class SolverJob
{
    readonly promise: Promise<Highs_Result>
    readonly time_limit_seconds: number
    readonly signal?: AbortSignal
    private resolve_promise: (result: Highs_Result) => void = ignore_result
    private reject_promise: (error: Error) => void = ignore_error
    private abort_listener: (() => void) | undefined
    private settled = false
    private readonly enqueued_at = Date.now()
    private started_at: number | undefined

    /**
     * @param lp LP model text
     * @param options time limit for this job, optional abort signal and timing callback
     */
    constructor(readonly lp: string, private readonly options: Solve_Options & { time_limit_seconds: number })
    {
        this.time_limit_seconds = options.time_limit_seconds
        this.signal = options.signal
        this.promise = new Promise<Highs_Result>((resolve, reject) =>
        {
            this.resolve_promise = resolve
            this.reject_promise = reject
        })
    }

    /**
     * Records that a worker picked the job up.
     */
    mark_started(): void
    {
        this.started_at = Date.now()
    }

    /**
     * Calls the listener once if the caller aborts before the job settles.
     * @param listener abort handler
     */
    watch_abort(listener: () => void): void
    {
        this.abort_listener = listener
        this.signal?.addEventListener('abort', listener, { once: true })
    }

    /**
     * @param result solver result
     */
    resolve(result: Highs_Result): void
    {
        if (this.finish())
        {
            this.resolve_promise(result)
        }
    }

    /**
     * @param error failure
     */
    reject(error: Error): void
    {
        if (this.finish())
        {
            this.reject_promise(error)
        }
    }

    /**
     * @returns whether this call settled the job
     */
    private finish(): boolean
    {
        if (this.settled)
        {
            return false
        }
        this.settled = true
        if (this.abort_listener)
        {
            this.signal?.removeEventListener('abort', this.abort_listener)
        }
        this.report_timing()
        return true
    }

    /**
     * Reports queue wait and solve time; a job that never started only waited.
     */
    private report_timing(): void
    {
        const finished_at = Date.now()
        const started_at = this.started_at ?? finished_at
        this.options.on_timing?.({ queue_wait_milliseconds: started_at - this.enqueued_at, solve_milliseconds: finished_at - started_at })
    }
}

/**
 * @param _result ignored
 */
function ignore_result(_result: Highs_Result): void
{
}

/**
 * @param _error ignored
 */
function ignore_error(_error: Error): void
{
}
