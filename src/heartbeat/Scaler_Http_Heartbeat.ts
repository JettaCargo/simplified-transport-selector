import { Logger } from '@jetta/logger'
import { post_user_active } from './post_user_active'

const logger = Logger.system_logger('Heartbeat')

/**
 * Repeating HTTP ping to system-scaler.
 */
export class ScalerHttpHeartbeat
{
    private stopped = false
    private timer: ReturnType<typeof setInterval> | null = null

    /**
     * @param interval_milliseconds delay between pings
     */
    constructor(private readonly interval_milliseconds: number)
    {}

    /**
     * Sends one ping unless the heartbeat was stopped.
     * @returns nothing
     */
    async beat(): Promise<void>
    {
        if (this.stopped)
        {
            return
        }
        try
        {
            await post_user_active()
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : String(error)
            logger.warn(`Heartbeat could not be recorded due: ${message}. Retrying...`)
        }
    }

    /**
     * Beats immediately, then on the interval.
     * @returns this heartbeat
     */
    start(): ScalerHttpHeartbeat
    {
        void this.beat()
        this.timer = setInterval(() =>
        {
            void this.beat()
        }, this.interval_milliseconds)
        return this
    }

    /**
     * Stops later pings.
     * @returns nothing
     */
    async stop(): Promise<void>
    {
        this.stopped = true
        if (!this.timer)
        {
            return
        }
        clearInterval(this.timer)
        this.timer = null
    }
}
