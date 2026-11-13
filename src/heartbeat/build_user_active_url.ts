/**
 * Builds the system-scaler user-active URL.
 * @param base_url scaler base URL
 * @param environment environment name
 * @returns user-active URL
 */
export function build_user_active_url(base_url: string, environment: string): string
{
    const trimmed_base_url = base_url.replace(/\/$/, '')
    return `${trimmed_base_url}/user-active?env=${encodeURIComponent(environment)}`
}
