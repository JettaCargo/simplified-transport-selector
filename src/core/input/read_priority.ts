/**
 * JSONObject.optBoolean ignores numbers and unknown strings and returns false.
 * @param value raw priority
 * @returns boolean priority
 */
export function read_priority(value: unknown): boolean
{
    if (value === true || value === false)
    {
        return value
    }
    if (typeof value === 'string' && value.toLowerCase() === 'true')
    {
        return true
    }
    return false
}
