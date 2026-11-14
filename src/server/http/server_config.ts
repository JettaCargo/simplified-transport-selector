import { z } from 'zod'

const server_environment_schema = z.object({
    MAX_BODY_BYTES: z.coerce.number().int().min(1).default(32 * 1024 * 1024),
    SERVER_REQUEST_TIMEOUT_MILLISECONDS: z.coerce.number().int().min(1).default(120000),
    SERVER_HEADERS_TIMEOUT_MILLISECONDS: z.coerce.number().int().min(1).default(60000),
})

/**
 * HTTP limits of the selector server.
 */
export interface Server_Config
{
    max_body_bytes: number
    request_timeout_milliseconds: number
    headers_timeout_milliseconds: number
}

/**
 * Reads and validates the HTTP limits.
 * @param environment process environment
 * @returns validated limits
 */
export function read_server_config(environment: Record<string, string | undefined>): Server_Config
{
    const parsed = server_environment_schema.parse(environment)
    return {
        max_body_bytes: parsed.MAX_BODY_BYTES,
        request_timeout_milliseconds: parsed.SERVER_REQUEST_TIMEOUT_MILLISECONDS,
        headers_timeout_milliseconds: parsed.SERVER_HEADERS_TIMEOUT_MILLISECONDS,
    }
}
