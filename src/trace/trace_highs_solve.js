const { Manual_Tracer, IO_Tracer, IO_Types } = require('@jetta/tracer')
const { solve_lp } = require('../solver/highs_client')
const { summarize_highs_result } = require('./summarize_highs_result')

const HIGHS_CONTEXT = 'highs-solve'

/**
 * Solves an LP with Manual_Tracer + IO_Tracer around the HiGHS sub-call.
 * @param {object} options
 * @param {string} options.trace_id Request trace id.
 * @param {string} options.model_text LP model text.
 * @param {string} [options.base_id] Optional selection / cargo base id.
 * @returns {Promise<object>} HiGHS result
 */
async function trace_highs_solve(options)
{
    const io_tracer = new IO_Tracer(options.trace_id, options.base_id)
    const tracer = new Manual_Tracer(options.trace_id, options.base_id)
    io_tracer.trace(options.model_text, IO_Types.INPUT, HIGHS_CONTEXT)
    const tx_id = tracer.start_transaction(HIGHS_CONTEXT, 'highs')
    try
    {
        const result = await solve_lp(options.model_text)
        io_tracer.trace(summarize_highs_result(result), IO_Types.OUTPUT, HIGHS_CONTEXT)
        tracer.end_transaction_succesfully(tx_id)
        return result
    }
    catch (error)
    {
        io_tracer.trace(
            { message: error && error.message ? error.message : String(error) },
            IO_Types.EXCEPTION,
            HIGHS_CONTEXT)
        tracer.end_transaction_with_failure(tx_id)
        throw error
    }
}

module.exports = trace_highs_solve
