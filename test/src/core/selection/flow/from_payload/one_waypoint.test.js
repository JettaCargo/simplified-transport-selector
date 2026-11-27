const { expect } = require('chai')
const { run_with_file } = require('../../../../../helpers/run_from_payload')

describe('OneWaypoint (from Java FromPayload)', function ()
{
    it('not_divide_waypoint keeps a single vehicle', async function ()
    {
        const response = await run_with_file('waypoint_1_not_divide_waypoint.json')
        expect(response.vehicles_array).to.have.length(1)
    })

    it('increase_one_transport adds a second vehicle for min required', async function ()
    {
        const response = await run_with_file('waypoint_1_increase_one_transport.json')
        expect(response.vehicles_array).to.have.length(2)
    })

    it('increase_by_min_volume pads fleet to ten vehicles', async function ()
    {
        const response = await run_with_file('waypoint_1_increase_by_min_volume.json')
        expect(response.vehicles_array).to.have.length(10)
    })

    it('increase_by_min_weight pads fleet to four vehicles', async function ()
    {
        const response = await run_with_file('waypoint_1_increase_by_min_weight.json')
        expect(response.vehicles_array).to.have.length(4)
    })

    it('transports_2 returns four vehicles', async function ()
    {
        const response = await run_with_file('waypoint_1_transports_2.json')
        expect(response.vehicles_array).to.have.length(4)
    })

    it('one_transport_limited scales LP floor by three up to stock', async function ()
    {
        const response = await run_with_file('waypoint_1_one_transport_limited.json')
        expect(response.vehicles_array).to.have.length(10)
    })
})
