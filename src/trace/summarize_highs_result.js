/**
 * Builds a compact HiGHS result summary for trace_io OUTPUT.
 * @param {object} result HiGHS solve result
 * @returns {{Status: *, ObjectiveValue: *, column_count: number}}
 */
function summarize_highs_result(result)
{
    const columns = result && result.Columns ? result.Columns : {}
    return {
        Status: result && result.Status,
        ObjectiveValue: result && result.ObjectiveValue,
        column_count: Object.keys(columns).length,
    }
}

module.exports = { summarize_highs_result }
