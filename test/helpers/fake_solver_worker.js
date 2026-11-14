const { parentPort } = require('worker_threads')

/**
 * Stand-in for the HiGHS worker. The LP text is a command:
 * `sleep:<ms>` answers Optimal after the delay, `hang` blocks the thread,
 * `crash` exits the worker, `throw` raises inside the worker,
 * `echo_time_limit` answers with the time limit it received.
 */
parentPort.on('message', job =>
{
    const [command, argument] = String(job.lp).split(':')
    if (command === 'sleep')
        return setTimeout(() => parentPort.postMessage({ result: { Status: 'Optimal', Columns: {} } }), Number(argument))
    if (command === 'hang')
        for (;;) { /* blocks like a long synchronous solve */ }
    if (command === 'crash')
        process.exit(3)
    if (command === 'throw')
        throw new Error('fake worker failure')
    if (command === 'echo_time_limit')
        return parentPort.postMessage({ result: { Status: 'Optimal', Columns: {}, time_limit_seconds: job.time_limit_seconds } })
    return parentPort.postMessage({ error: `unknown fake command ${command}` })
})
