const { expect } = require('chai')
const { select_transports } = require('../../../../../build/index')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')
const { use_env } = require('../../../../helpers/scaler_fixtures')
const PAYLOAD = require('../../../../data/src/core/selection/flow/packing_retry/first_fit_needs_second_type.json')

/**
 * Five 4 kg collects. Two 10 kg small trucks hold 20 kg in aggregate and are
 * the cheapest two-vehicle answer, but first-fit only packs four collects into
 * them. One small truck plus the 12 kg large truck packs all five.
 */
describe('packing retry', function ()
{
    let restore

    afterEach(function ()
    {
        restore()
    })

    it('re-solves without the unpackable assignment and returns a packed fleet', async function ()
    {
        restore = use_env({ PACKING_RETRY_LIMIT: undefined })
        const output = await select_transports(structuredClone(PAYLOAD))
        expect(output.apiError, JSON.stringify(output)).to.equal(undefined)
        const vehicle_ids = output.vehicles_array.map(entry => entry.vehicle.id).sort()
        expect(vehicle_ids).to.deep.equal(['large_truck', 'small_truck'])
        const collect_ids = output.vehicles_array.flatMap(entry => entry.collects.map(collect => collect.id)).sort()
        expect(collect_ids).to.deep.equal(['collect_1', 'collect_2', 'collect_3', 'collect_4', 'collect_5'])
    })

    it('keeps every packed vehicle within its weight capacity', async function ()
    {
        restore = use_env({ PACKING_RETRY_LIMIT: undefined })
        const output = await select_transports(structuredClone(PAYLOAD))
        const capacity = Object.fromEntries(PAYLOAD.vehicles.map(vehicle => [vehicle.id, vehicle.supported_weight]))
        for (const entry of output.vehicles_array)
            expect(entry.collects.length * 4).to.be.at.most(capacity[entry.vehicle.id])
    })

    it('reports the packing-failed key when retries are disabled', async function ()
    {
        restore = use_env({ PACKING_RETRY_LIMIT: '0' })
        const output = await select_transports(structuredClone(PAYLOAD))
        expect(output.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED)
    })
})
