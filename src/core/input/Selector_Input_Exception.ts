import { Message_Tuple } from '../types/message_tuple'

/**
 * Invalid selector payload. `message` is the catalog key.
 */
export class SelectorInputException extends Error
{
    readonly message_entry: Message_Tuple

    /**
     * @param key catalog key
     * @param params `%s` parameters
     */
    constructor(key: string, params: string[])
    {
        super(key)
        this.name = 'SelectorInputException'
        this.message_entry = [key, ...params]
    }
}
