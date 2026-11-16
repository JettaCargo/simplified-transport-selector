/**
 * Uppercases a measure string and leaves other values for the enum to reject.
 * @param value raw measure
 * @returns uppercased string or the original value
 */
export function uppercase_string(value: unknown): unknown
{
    if (typeof value !== 'string')
    {
        return value
    }
    return value.toUpperCase()
}
