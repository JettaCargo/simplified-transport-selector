const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

/**
 * Turns a numeric string into a number and leaves other values unchanged.
 * @param value raw field
 * @returns a finite number or the original value
 */
export function read_number(value: unknown): unknown
{
    if (typeof value === 'number')
    {
        return value
    }
    if (typeof value !== 'string')
    {
        return value
    }
    return number_from_decimal_string(value)
}

/**
 * @param value raw string
 * @returns parsed number or the original string
 */
function number_from_decimal_string(value: string): unknown
{
    const trimmed = value.trim()
    if (!DECIMAL_PATTERN.test(trimmed))
    {
        return value
    }
    return Number(trimmed)
}
