/**
 * LP-safe identifier.
 * @param value raw id
 * @returns sanitized id
 */
export function sanitize(value: string): string
{
    return String(value).replace(/[^A-Za-z0-9_]/g, '_')
}
