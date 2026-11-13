import { Error_Envelope } from '../types/error_envelope'
import { Message_Tuple } from '../types/message_tuple'

/**
 * Builds the HTTP error body. `msg` and `apiError` are the dotted key.
 * @param key catalog key
 * @param params `%s` parameters
 * @returns error envelope
 */
export function error_response(key: string, params: string[] = []): Error_Envelope
{
    const entry: Message_Tuple = [key, ...params]
    return {
        msg: key,
        apiError: key,
        messages: {
            errors: [entry],
            warnings: [],
            infos: [],
        },
    }
}
