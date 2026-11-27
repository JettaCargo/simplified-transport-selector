/**
 * @returns {{ lines: { level: string, text: string }[], log: Function, error: Function }} logger that keeps every line
 */
function capturing_logger()
{
    const lines = []
    return {
        lines,
        log: (...args) => lines.push({ level: 'log', text: args.join(' ') }),
        error: (...args) => lines.push({ level: 'error', text: args.join(' ') }),
    }
}

module.exports = { capturing_logger }
