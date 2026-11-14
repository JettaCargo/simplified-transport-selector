const { parentPort } = require('worker_threads')

let highs_promise

/**
 * Real HiGHS worker that rewrites the result as configured through the
 * environment the worker was spawned with: STATUS_OVERRIDE replaces Status,
 * DROP_COLUMNS=1 removes the incumbent.
 */
parentPort?.on('message', async job =>
{
    highs_promise = highs_promise || import('highs').then(module => module.default())
    const highs = await highs_promise
    const result = highs.solve(job.lp, { time_limit: job.time_limit_seconds, output_flag: false })
    if (process.env.STATUS_OVERRIDE)
        result.Status = process.env.STATUS_OVERRIDE
    if (process.env.DROP_COLUMNS === '1')
        result.Columns = {}
    parentPort.postMessage({ result })
})
