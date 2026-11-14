import { shared_solver_pool } from '../pool/shared_solver_pool'
import { Solve_Options } from '../pool/solve_options'
import { Highs_Result } from './highs_result'

/**
 * Solves an LP string with HiGHS on an isolated worker.
 * @param model_text LP model
 * @param options abort signal and time limit
 * @returns HiGHS result
 */
export function solve_lp(model_text: string, options: Solve_Options = {}): Promise<Highs_Result>
{
    return shared_solver_pool().solve(model_text, options)
}
