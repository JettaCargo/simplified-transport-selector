import { parentPort } from 'worker_threads'
import { Highs_Module } from '../highs/highs_module'
import { Solver_Worker_Request } from './solver_worker_message'

let highs_promise: Promise<Highs_Module> | undefined

/**
 * Worker entry: solves one LP per message with a fresh HiGHS instance.
 */
parentPort?.on('message', solve_job)

/**
 * @param request LP and time limit
 */
async function solve_job(request: Solver_Worker_Request): Promise<void>
{
    const highs = await load_highs()
    try
    {
        const result = highs.solve(request.lp, { time_limit: request.time_limit_seconds, output_flag: false })
        parentPort?.postMessage({ result })
    }
    catch (error)
    {
        parentPort?.postMessage({ error: error instanceof Error ? error.message : String(error) })
    }
}

/**
 * @returns the HiGHS module of this worker
 */
function load_highs(): Promise<Highs_Module>
{
    highs_promise = highs_promise || import('highs').then(start_highs)
    return highs_promise
}

/**
 * @param imported dynamic import of the highs package
 * @returns HiGHS module
 */
function start_highs(imported: typeof import('highs')): Promise<Highs_Module>
{
    const factory = imported.default as unknown as () => Promise<Highs_Module>
    return factory()
}
