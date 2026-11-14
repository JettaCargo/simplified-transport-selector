import { Highs_Result } from './highs_result'

/**
 * Options this service passes to a HiGHS solve.
 */
export interface Highs_Solve_Options
{
    time_limit: number
    output_flag: boolean
}

/**
 * HiGHS module surface this service calls. `solve` blocks its thread.
 */
export interface Highs_Module
{
    solve: (model_text: string, options: Highs_Solve_Options) => Highs_Result
}
