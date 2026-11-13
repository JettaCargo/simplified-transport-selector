import { Message_Tuple } from './message_tuple'

/**
 * Failure body. `msg` and `apiError` stay for the gateway; `messages` is additive.
 */
export interface Error_Envelope
{
    msg: string
    apiError: string
    messages: {
        errors: Message_Tuple[]
        warnings: []
        infos: []
    }
}
