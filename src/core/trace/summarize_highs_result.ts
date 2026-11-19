import { Highs_Result } from '../solver/highs/highs_result'

/**
 * Compact HiGHS result summary for trace_io OUTPUT.
 */
export interface Highs_Result_Summary
{
    Status: string | undefined
    ObjectiveValue: number | undefined
    column_count: number
}

/**
 * Builds a compact HiGHS result summary for trace_io OUTPUT.
 * @param result HiGHS solve result
 * @returns summary without Columns dump
 */
export function summarize_highs_result(result: Highs_Result): Highs_Result_Summary
{
    const columns = result.Columns || {}
    return {
        Status: result.Status,
        ObjectiveValue: result.ObjectiveValue,
        column_count: Object.keys(columns).length,
    }
}
