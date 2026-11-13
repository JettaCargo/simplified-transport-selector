import { Highs_Column } from './highs_column'

/**
 * HiGHS solve result used by the selector.
 */
export interface Highs_Result
{
    Status: string
    Columns?: Record<string, Highs_Column>
}
