import { post } from '@jetta/http'
import { DEFAULT_SCALER_URL } from '../config/scaler_heartbeat_constants'
import { build_user_active_url } from './build_user_active_url'

/**
 * Posts one user-active ping.
 * @returns nothing
 */
export async function post_user_active(): Promise<void>
{
    await post({
        service: 'system-scaler',
        url: build_user_active_url(resolve_scaler_url(), process.env.ENV || ''),
        payload: '',
        max_retries: 1,
    })
}

/**
 * @returns scaler base URL
 */
function resolve_scaler_url(): string
{
    return process.env.SYSTEM_SCALER_URL || DEFAULT_SCALER_URL
}
