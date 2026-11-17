const { Manual_Tracer } = require('@jetta/tracer')

/**
 * Runs an async function inside a Manual_Tracer start/end pair.
 * Always ends the transaction exactly once (success or failure).
 *
 * @param {object} options
 * @param {string} options.trace_id Request trace id.
 * @param {string} options.context Transaction context label.
 * @param {Function} options.async_fn Async work to wrap.
 * @param {string} [options.to] Optional callee system name stored as `to`.
 * @param {string} [options.base_id] Optional selection / cargo base id.
 * @returns {Promise<*>} Result of async_fn.
 */
async function with_manual_transaction(options)
{
    const tracer = new Manual_Tracer(options.trace_id, options.base_id)
    const tx_id = tracer.start_transaction(options.context, options.to)
    try
    {
        const result = await options.async_fn()
        tracer.end_transaction_succesfully(tx_id)
        return result
    }
    catch (error)
    {
        tracer.end_transaction_with_failure(tx_id)
        throw error
    }
}

module.exports = with_manual_transaction
