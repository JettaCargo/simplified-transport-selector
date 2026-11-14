/**
 * Missing criteria become DISABLED, then the enum is uppercase.
 * @param value raw criteria
 * @returns normalized criteria
 */
export function normalize_criteria(value: unknown): string
{
    if (value == null || value === '')
    {
        return 'DISABLED'
    }
    return String(value).toUpperCase()
}
