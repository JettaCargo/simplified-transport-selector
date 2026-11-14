import { Model_Context } from './model_context'

/**
 * Renders the accumulated MILP as an LP file.
 * @param context model pieces
 * @returns LP text
 */
export function render_lp(context: Model_Context): string
{
    return [
        'Minimize',
        ` obj: ${context.objective.join(' + ')}`,
        'Subject To',
        ...context.constraints.map(prefix_line),
        'Bounds',
        ...context.bounds.map(prefix_line),
        'General',
        ...context.generals.map(prefix_line),
        'Binary',
        ...context.binaries.map(prefix_line),
        'End',
    ].join('\n')
}

/**
 * @param line LP line
 * @returns indented line
 */
function prefix_line(line: string): string
{
    return ` ${line}`
}
