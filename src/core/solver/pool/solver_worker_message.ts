import { Highs_Result } from '../highs/highs_result'

/**
 * Job sent to a solver worker.
 */
export interface Solver_Worker_Request
{
    lp: string
    time_limit_seconds: number
}

/**
 * Reply from a solver worker: a result, or the error HiGHS raised.
 */
export interface Solver_Worker_Reply
{
    result?: Highs_Result
    error?: string
}
