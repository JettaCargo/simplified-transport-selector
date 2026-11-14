import { setTimeout as sleep } from 'timers/promises'
import { Highs_Result } from '../highs/highs_result'
import { RequestAbortedException } from './errors/Request_Aborted_Exception'
import { SolverPoolBusyException } from './errors/Solver_Pool_Busy_Exception'
import { SolverJob } from './Solver_Job'
import { Solve_Options } from './solve_options'
import { Solver_Pool_Config } from './solver_pool_config'
import { SolverWorkerSlot } from './Solver_Worker_Slot'

const DRAIN_POLL_MILLISECONDS = 20

/**
 * Fixed set of isolated solver workers with a bounded FIFO queue.
 * A job that hangs, crashes, or is abandoned only affects its own worker.
 */
export class SolverPool
{
    private readonly slots: SolverWorkerSlot[]
    private readonly queue: SolverJob[] = []
    private closed = false

    /**
     * @param config pool settings
     * @param worker_path compiled worker entry
     */
    constructor(private readonly config: Solver_Pool_Config, worker_path: string)
    {
        const settings = { ...config, worker_path }
        this.slots = Array.from({ length: config.pool_size }, () => new SolverWorkerSlot(settings, this.handle_free))
    }

    /**
     * Solves an LP on the next free worker.
     * @param lp LP model text
     * @param options abort signal, time limit, and timing callback
     * @returns HiGHS result
     */
    solve(lp: string, options: Solve_Options = {}): Promise<Highs_Result>
    {
        const time_limit_seconds = Math.min(this.config.time_limit_seconds, options.time_limit_seconds ?? Number.POSITIVE_INFINITY)
        const job = new SolverJob(lp, { ...options, time_limit_seconds })
        if (options.signal?.aborted)
        {
            job.reject(new RequestAbortedException())
            return job.promise
        }
        this.dispatch(job)
        return job.promise
    }

    /**
     * @returns whether a new job would be rejected as busy
     */
    is_saturated(): boolean
    {
        return this.closed || (!this.idle_slot() && this.queue.length >= this.config.queue_limit)
    }

    /**
     * @returns running plus queued jobs
     */
    in_flight(): number
    {
        return this.slots.filter(slot => !slot.is_idle()).length + this.queue.length
    }

    /**
     * Waits until no job is in flight.
     * @param timeout_milliseconds maximum wait
     * @returns whether the pool drained in time
     */
    async drain(timeout_milliseconds: number): Promise<boolean>
    {
        const deadline = Date.now() + timeout_milliseconds
        while (this.in_flight() > 0 && Date.now() < deadline)
        {
            await sleep(DRAIN_POLL_MILLISECONDS)
        }
        return this.in_flight() === 0
    }

    /**
     * Rejects every pending job and stops every worker.
     * @returns when all workers have stopped
     */
    async close(): Promise<void>
    {
        this.closed = true
        for (const job of this.queue.splice(0))
        {
            job.reject(new SolverPoolBusyException())
        }
        await Promise.all(this.slots.map(slot => slot.terminate(new SolverPoolBusyException())))
    }

    /**
     * @param job job to run now, queue, or reject
     */
    private dispatch(job: SolverJob): void
    {
        const slot = this.closed ? undefined : this.idle_slot()
        if (slot)
        {
            job.watch_abort(() => this.abort(job))
            slot.run(job)
            return
        }
        if (this.closed || this.queue.length >= this.config.queue_limit)
        {
            job.reject(new SolverPoolBusyException())
            return
        }
        job.watch_abort(() => this.abort(job))
        this.queue.push(job)
    }

    /**
     * @param job job whose caller aborted
     */
    private abort(job: SolverJob): void
    {
        const queued_index = this.queue.indexOf(job)
        if (queued_index >= 0)
        {
            this.queue.splice(queued_index, 1)
            job.reject(new RequestAbortedException())
            return
        }
        this.slots.find(slot => slot.runs(job))?.fail(new RequestAbortedException())
    }

    /**
     * @returns a slot without a job
     */
    private idle_slot(): SolverWorkerSlot | undefined
    {
        return this.slots.find(slot => slot.is_idle())
    }

    private readonly handle_free = (slot: SolverWorkerSlot): void =>
    {
        const next = this.closed ? undefined : this.queue.shift()
        if (next)
        {
            slot.run(next)
        }
    }
}
