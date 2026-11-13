import { SCALER_HEARTBEAT_ENVIRONMENTS } from './scaler_heartbeat_constants'

/**
 * Heartbeat runs only in dev and stage.
 * @param environment ENV value
 * @returns whether the heartbeat should run
 */
export function should_enable_scaler_heartbeat(environment: string | undefined): boolean
{
    return SCALER_HEARTBEAT_ENVIRONMENTS.has(environment || '')
}
