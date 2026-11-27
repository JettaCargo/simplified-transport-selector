import { Worker } from 'worker_threads'
import { SolverTimeoutException } from './errors/Solver_Timeout_Exception'
import { SolverWorkerCrashException } from './errors/Solver_Worker_Crash_Exception'
import { SolverJob } from './Solver_Job'
import { Solver_Worker_Reply } from './solver_worker_message'

/**
 * How a slot starts its worker and bounds each job.
 */
export interface Solver_Worker_Slot_Settings
{
    worker_path: string
    worker_max_old_generation_mb: number
    hard_timeout_grace_milliseconds: number
}

/**
 * One worker thread running at most one job. A failed or overdue worker is
 * replaced so no later job inherits its state.
 */
export class SolverWorkerSlot
{
    private worker: Worker | undefined
    private job: SolverJob | undefined
    private timer: ReturnType<typeof setTimeout> | undefined

    /**
     * @param settings worker start and deadline settings
     * @param on_free called when the slot can take the next job
     */
    constructor(private readonly settings: Solver_Worker_Slot_Settings, private readonly on_free: (slot: SolverWorkerSlot) => void)
    {
        this.worker = this.spawn()
    }

    /**
     * @returns whether the slot has no job
     */
    is_idle(): boolean
    {
        return this.job === undefined
    }

    /**
     * @param job job
     * @returns whether this slot runs the job
     */
    runs(job: SolverJob): boolean
    {
        return this.job === job
    }

    /**
     * Starts a job on the worker with a hard deadline.
     * @param job job
     */
    run(job: SolverJob): void
    {
        this.job = job
        job.mark_started()
        const deadline = job.time_limit_seconds * 1000 + this.settings.hard_timeout_grace_milliseconds
        this.timer = setTimeout(this.handle_deadline, deadline)
        this.worker = this.worker || this.spawn()
        this.worker.postMessage({ lp: job.lp, time_limit_seconds: job.time_limit_seconds })
    }

    /**
     * Fails the running job, discards the worker, and frees the slot.
     * A replacement is warmed up only when a job was running, so a worker
     * that dies while idle cannot cause a respawn loop.
     * @param error failure for the job
     */
    fail(error: Error): void
    {
        const job = this.release()
        this.discard_worker()
        if (job)
        {
            this.worker = this.spawn()
        }
        job?.reject(error)
        this.on_free(this)
    }

    /**
     * Fails the running job and stops the worker for good.
     * @param error failure for the running job
     * @returns when the worker has stopped
     */
    async terminate(error: Error): Promise<void>
    {
        const job = this.release()
        const worker = this.worker
        this.worker = undefined
        detach(worker)
        job?.reject(error)
        await worker?.terminate()
    }

    /**
     * Detaches and stops the current worker without waiting for it.
     */
    private discard_worker(): void
    {
        detach(this.worker)
        void this.worker?.terminate()
        this.worker = undefined
    }

    /**
     * @returns a started worker with listeners attached
     */
    private spawn(): Worker
    {
        const worker = new Worker(this.settings.worker_path, {
            resourceLimits: { maxOldGenerationSizeMb: this.settings.worker_max_old_generation_mb },
        })
        worker.on('message', this.handle_message)
        worker.on('error', this.handle_error)
        worker.on('exit', this.handle_exit)
        worker.unref()
        return worker
    }

    /**
     * @returns the job that was running, now detached from the slot
     */
    private release(): SolverJob | undefined
    {
        const job = this.job
        clearTimeout(this.timer)
        this.job = undefined
        this.timer = undefined
        return job
    }

    private readonly handle_message = (reply: Solver_Worker_Reply): void =>
    {
        if (reply.error !== undefined || !reply.result)
        {
            this.fail(new SolverWorkerCrashException(reply.error || 'empty worker reply'))
            return
        }
        const job = this.release()
        job?.resolve(reply.result)
        this.on_free(this)
    }

    private readonly handle_error = (error: Error): void => this.fail(new SolverWorkerCrashException(error.message))

    private readonly handle_exit = (code: number): void => this.fail(new SolverWorkerCrashException(`worker exited with code ${code}`))

    private readonly handle_deadline = (): void => this.fail(new SolverTimeoutException())
}

/**
 * Removes the slot listeners from a worker being thrown away. A late `error`
 * from that worker belongs to a job that already settled, so it is dropped
 * instead of crashing the process as an unhandled event.
 * @param worker worker being discarded
 */
function detach(worker: Worker | undefined): void
{
    worker?.removeAllListeners()
    worker?.on('error', drop_late_worker_error)
}

/**
 * @param _error error from a discarded worker
 */
function drop_late_worker_error(_error: Error): void
{
}
