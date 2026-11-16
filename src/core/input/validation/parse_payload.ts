import { ZodError } from 'zod'
import { SelectorInputException } from './Selector_Input_Exception'
import { selector_input_schema } from '../schema/selector_input_schema'
import { Validated_Input } from './validated_input'
import { format_validation_message } from './format_validation_message'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'

/**
 * Parses the payload or throws a catalog validation error.
 * @param payload raw request body
 * @returns validated input
 */
export function parse_payload(payload: unknown): Validated_Input
{
    try
    {
        return selector_input_schema.parse(payload) as Validated_Input
    }
    catch (error)
    {
        if (error instanceof ZodError)
        {
            throw new SelectorInputException(
                TRANSPORT_SELECTOR_MESSAGE.INVALID_FIELD,
                [format_validation_message(error)],
            )
        }
        throw error
    }
}
