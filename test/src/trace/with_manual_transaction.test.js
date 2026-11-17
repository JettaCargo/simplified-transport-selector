const { expect } = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const { create_fake_tracer_library } = require('./fake_tracer_library')

describe('with_manual_transaction', () =>
{
    it('starts and ends successfully around async_fn', async () =>
    {
        const fake = create_fake_tracer_library()
        const with_manual_transaction = proxyquire(
            '../../../src/trace/with_manual_transaction',
            { '@jetta/tracer': fake })

        const result = await with_manual_transaction({
            trace_id: 'trace-1',
            base_id: 'sel-0',
            context: 'build-aggregated-model',
            async_fn: async () => 42,
        })

        expect(result).to.equal(42)
        expect(fake.constructed_manual).to.deep.equal([{ trace_id: 'trace-1', base_id: 'sel-0' }])
        expect(fake.starts[0].context).to.equal('build-aggregated-model')
        expect(fake.ends).to.deep.equal([{ tx_id: 'tx-1', outcome: 'success' }])
    })

    it('ends with failure and rethrows when async_fn throws', async () =>
    {
        const fake = create_fake_tracer_library()
        const with_manual_transaction = proxyquire(
            '../../../src/trace/with_manual_transaction',
            { '@jetta/tracer': fake })

        let caught
        try
        {
            await with_manual_transaction({
                trace_id: 'trace-1',
                context: 'pack-fleet',
                to: undefined,
                async_fn: async () =>
                {
                    throw new Error('boom')
                },
            })
        }
        catch (error)
        {
            caught = error
        }

        expect(caught.message).to.equal('boom')
        expect(fake.ends).to.deep.equal([{ tx_id: 'tx-1', outcome: 'failure' }])
    })
})
