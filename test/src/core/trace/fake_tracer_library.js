/**
 * Builds stub Manual_Tracer / IO_Tracer factories for selection tracing tests.
 * @returns {object}
 */
function create_fake_tracer_library()
{
    const constructed_manual = []
    const constructed_io = []
    const starts = []
    const ends = []
    const io_calls = []
    let next_tx = 1

    function Manual_Tracer(trace_id, base_id)
    {
        constructed_manual.push({ trace_id, base_id })
        this.start_transaction = (context, to) =>
        {
            const tx_id = `tx-${next_tx++}`
            starts.push({ tx_id, context, to, trace_id })
            return tx_id
        }
        this.end_transaction_succesfully = (tx_id) =>
        {
            ends.push({ tx_id, outcome: 'success' })
        }
        this.end_transaction_with_failure = (tx_id) =>
        {
            ends.push({ tx_id, outcome: 'failure' })
        }
    }

    function IO_Tracer(trace_id, base_id)
    {
        constructed_io.push({ trace_id, base_id })
        this.trace = (payload, type, context) =>
        {
            io_calls.push({ payload, type, context, trace_id })
        }
    }

    return {
        Manual_Tracer,
        IO_Tracer,
        IO_Types: { INPUT: 'input', OUTPUT: 'output', EXCEPTION: 'exception' },
        constructed_manual,
        constructed_io,
        starts,
        ends,
        io_calls,
    }
}

module.exports = { create_fake_tracer_library }
