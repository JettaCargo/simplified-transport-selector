const { parentPort } = require('worker_threads')

const HANG_MARKER = 'HANG_MARKER'
const CRASH_MARKER = 'CRASH_MARKER'
let highs_promise

/**
 * Real HiGHS worker that misbehaves on purpose for marked models:
 * an LP mentioning HANG_MARKER blocks the thread, CRASH_MARKER exits it.
 */
parentPort?.on('message', async job =>
{
    if (job.lp.includes(HANG_MARKER))
        for (;;) { /* blocks like a runaway synchronous solve */ }
    if (job.lp.includes(CRASH_MARKER))
        process.exit(7)
    highs_promise = highs_promise || import('highs').then(module => module.default())
    const highs = await highs_promise
    parentPort.postMessage({ result: highs.solve(job.lp, { time_limit: job.time_limit_seconds, output_flag: false }) })
})

module.exports = { HANG_MARKER, CRASH_MARKER }
