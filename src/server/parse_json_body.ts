import { InvalidJsonException } from './Invalid_Json_Exception'

/**
 * Parses a request body, or throws the invalid-JSON catalog error.
 * @param raw body text
 * @returns parsed JSON
 */
export function parse_json_body(raw: string): unknown
{
    try
    {
        return JSON.parse(raw)
    }
    catch
    {
        throw new InvalidJsonException()
    }
}
