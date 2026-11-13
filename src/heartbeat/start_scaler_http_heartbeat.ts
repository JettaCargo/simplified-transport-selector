import { Logger } from '@jetta/logger'
import { DEFAULT_INTERVAL_MILLISECONDS } from './scaler_heartbeat_constants'
import { ScalerHttpHeartbeat } from './Scaler_Http_Heartbeat'
import { should_enable_scaler_heartbeat } from './should_enable_scaler_heartbeat'

const logger = Logger.system_logger('Heartbeat')

/**
 * Starts process-level HTTP pings to system-scaler `/user-active`.
 * @param options optional interval
 * @returns a stop handle
 */
export function start_scaler_http_heartbeat(options: { interval_milliseconds?: number } = {}): { stop: () => Promise<void> }
{
    if (!should_enable_scaler_heartbeat(process.env.ENV))
    {
        logger.log('Heartbeat not activated because ENV is not dev or stage')
        return { stop: stop_inactive_heartbeat }
    }
    const interval_milliseconds = options.interval_milliseconds || DEFAULT_INTERVAL_MILLISECONDS
    return new ScalerHttpHeartbeat(interval_milliseconds).start()
}

/**
 * @returns nothing
 */
async function stop_inactive_heartbeat(): Promise<void>
{
}
