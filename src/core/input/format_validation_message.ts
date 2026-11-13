import { ZodError } from 'zod'

/**
 * Joins Zod issues into the single catalog parameter.
 * @param error zod error
 * @returns field paths and messages
 */
export function format_validation_message(error: ZodError): string
{
    return error.issues.map(format_issue).join('; ')
}

/**
 * @param issue zod issue
 * @returns path and message
 */
function format_issue(issue: { path: PropertyKey[], message: string }): string
{
    const path = issue.path.join('.')
    if (!path)
    {
        return issue.message
    }
    return `${path}: ${issue.message}`
}
