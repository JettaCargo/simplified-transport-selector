const { expect } = require('chai')
const { select_transports } = require('../../../../../build/index')
const { create_fake_tracer_library } = require('../../trace/fake_tracer_library')
const SELECTION_PAYLOAD = require('../../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

describe('select_transports tracing', function ()
{
    it('binds Manual_Tracer to payload.trace_id and spans heavy steps', async function ()
    {
        const fake = create_fake_tracer_library()
        const payload = structuredClone(SELECTION_PAYLOAD)
        payload.trace_id = 'portal-trace&99'
        payload.log_header = 'base/wp-selection-0'

        const result = await select_transports(payload, { tracer_library: fake })

        expect(result.vehicles_array).to.be.an('array').that.is.not.empty
        expect(fake.constructed_manual[0]).to.deep.equal({
            trace_id: 'portal-trace&99',
            base_id: 'base/wp-selection-0',
        })
        const contexts = fake.starts.map(start => start.context)
        expect(contexts).to.include('transport-selection')
        expect(contexts).to.include('build-aggregated-model')
        expect(contexts).to.include('highs-solve')
        expect(contexts).to.include('pack-fleet')
        expect(fake.starts.find(start => start.context === 'transport-selection').to)
            .to.equal('simplified-transport-selector')
        expect(fake.starts.find(start => start.context === 'highs-solve').to)
            .to.equal('highs')
        expect(fake.io_calls.map(call => call.type)).to.deep.equal(['input', 'output'])
        expect(fake.ends.every(end => end.outcome === 'success')).to.equal(true)
    })

    it('skips all tracing when trace_id is absent', async function ()
    {
        const fake = create_fake_tracer_library()
        const payload = structuredClone(SELECTION_PAYLOAD)
        delete payload.trace_id

        const result = await select_transports(payload, { tracer_library: fake })

        expect(result.vehicles_array).to.be.an('array')
        expect(fake.constructed_manual).to.deep.equal([])
        expect(fake.starts).to.deep.equal([])
        expect(fake.io_calls).to.deep.equal([])
    })
})
