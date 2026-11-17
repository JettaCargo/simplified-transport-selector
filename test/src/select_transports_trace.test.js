const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru()
const { create_fake_tracer_library } = require('./trace/fake_tracer_library')

const FIXTURE = path.join(
    __dirname,
    '../data/from_payload/waypoint_1_itens_2_transport_1.json')

/**
 * @returns {object}
 */
function load_payload()
{
    return JSON.parse(fs.readFileSync(FIXTURE, 'utf8'))
}

/**
 * @param {object} fake
 * @param {Function} [solve_lp]
 * @returns {Function}
 */
function load_select_transports(fake, solve_lp)
{
    const vehicle_id = '602abc1e1a3f08001087dd7c'
    const group_id = '602ab91111101087dc93'
    const default_solve = async () => ({
        Status: 'Optimal',
        ObjectiveValue: 1,
        Columns: {
            [`n_${vehicle_id}`]: { Primal: 1 },
            [`x_${group_id}_${vehicle_id}`]: { Primal: 1 },
        },
    })
    return proxyquire('../../src/select_transports', {
        '@jetta/tracer': fake,
        './trace/with_manual_transaction': proxyquire(
            '../../src/trace/with_manual_transaction',
            { '@jetta/tracer': fake }),
        './trace/trace_highs_solve': proxyquire(
            '../../src/trace/trace_highs_solve',
            {
                '@jetta/tracer': fake,
                '../solver/highs_client': { solve_lp: solve_lp || default_solve },
            }),
        './solver/highs_client': { solve_lp: solve_lp || default_solve },
    }).select_transports
}

describe('select_transports tracing', () =>
{
    it('binds Manual_Tracer to payload.trace_id and spans heavy steps', async () =>
    {
        const fake = create_fake_tracer_library()
        const select_transports = load_select_transports(fake)
        const payload = load_payload()
        payload.trace_id = 'portal-trace&99'
        payload.log_header = 'base/wp-selection-0'

        const result = await select_transports(payload)

        expect(result.vehicles_array).to.be.an('array').with.lengthOf(1)
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

    it('skips all tracing when trace_id is absent', async () =>
    {
        const fake = create_fake_tracer_library()
        const select_transports = load_select_transports(fake)
        const payload = load_payload()
        delete payload.trace_id

        const result = await select_transports(payload)

        expect(result.vehicles_array).to.be.an('array')
        expect(fake.constructed_manual).to.deep.equal([])
        expect(fake.constructed_io).to.deep.equal([])
        expect(fake.starts).to.deep.equal([])
        expect(fake.io_calls).to.deep.equal([])
    })
})
