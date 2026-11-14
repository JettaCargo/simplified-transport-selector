import { error_response } from '../../messages/envelope/error_response'
import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'
import { HIGHS_STATUS } from '../../solver/highs/highs_status'
import { Highs_Result } from '../../solver/highs/highs_result'

/**
 * Accepts a proven optimum or the incumbent of a time-limited solve.
 * Every other status, including OptimalInfeas, is reported.
 * @param result HiGHS result
 * @returns the catalog error, or undefined when the result can be packed
 */
export function unusable_solver_result(result: Highs_Result): Error_Envelope | undefined
{
    if (result.Status === HIGHS_STATUS.OPTIMAL)
    {
        return undefined
    }
    if (result.Status === HIGHS_STATUS.TIME_LIMIT_REACHED)
    {
        return has_incumbent(result) ? undefined : error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT)
    }
    return error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS, [String(result.Status)])
}

/**
 * @param result HiGHS result
 * @returns whether the solve left a primal solution
 */
function has_incumbent(result: Highs_Result): boolean
{
    const columns = Object.values(result.Columns || {})
    return Number.isFinite(result.ObjectiveValue) && columns.some(column => typeof column.Primal === 'number')
}
