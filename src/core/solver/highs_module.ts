import { Highs_Result } from './highs_result'

/**
 * HiGHS module surface this service calls.
 */
export interface Highs_Module
{
    solve: (model_text: string) => Promise<Highs_Result>
}
