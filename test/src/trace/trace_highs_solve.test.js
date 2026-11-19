const { expect } = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const { create_fake_tracer_library } = require('./fake_tracer_library')

describe('trace_highs_solve', () =>
{
    it('traces INPUT and OUTPUT around highs solve under Manual_Tracer', async () =>
    {
        const fake = create_fake_tracer_library()
        const solve_lp = async () => ({
            Status: 'Optimal',
            ObjectiveValue: 3,
            Columns: { n_t1: {}, x_g1_t1: {} },
        })
        const trace_highs_solve = proxyquire(
            '../../../src/trace/trace_highs_solve',
            {
                '@jetta/tracer': fake,
                '../solver/highs_client': { solve_lp },
            })

        const result = await trace_highs_solve({
            trace_id: 'portal-trace',
            base_id: 'sel-0',
            model_text: 'Minimize\n obj: n_t1\nEnd',
        })

        expect(result.Status).to.equal('Optimal')
        expect(fake.starts[0]).to.include({
            context: 'highs-solve',
            to: 'highs',
            trace_id: 'portal-trace',
        })
        expect(fake.ends[0].outcome).to.equal('success')
        expect(fake.io_calls[0]).to.deep.include({
            type: 'input',
            context: 'highs-solve',
            payload: 'Minimize\n obj: n_t1\nEnd',
        })
        expect(fake.io_calls[1].type).to.equal('output')
        expect(fake.io_calls[1].payload).to.deep.equal({
            Status: 'Optimal',
            ObjectiveValue: 3,
            column_count: 2,
        })
    })

    it('traces EXCEPTION and ends failure when solve throws', async () =>
    {
        const fake = create_fake_tracer_library()
        const solve_lp = async () =>
        {
            throw new Error('wasm boom')
        }
        const trace_highs_solve = proxyquire(
            '../../../src/trace/trace_highs_solve',
            {
                '@jetta/tracer': fake,
                '../solver/highs_client': { solve_lp },
            })

        let caught
        try
        {
            await trace_highs_solve({
                trace_id: 'portal-trace',
                model_text: 'lp',
            })
        }
        catch (error)
        {
            caught = error
        }

        expect(caught.message).to.equal('wasm boom')
        expect(fake.ends[0].outcome).to.equal('failure')
        expect(fake.io_calls.map(call => call.type)).to.deep.equal(['input', 'exception'])
    })
})
