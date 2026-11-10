const { expect } = require('chai')
const { run_with_file } = require('../helpers/run_from_payload')

describe('OneTransportMultipleWaypoints (from Java FromPayload)', function ()
{
    it('waypoint_1_itens_2_transport_1 fits in one vehicle', async function ()
    {
        const response = await run_with_file('waypoint_1_itens_2_transport_1.json')
        expect(response.vehicles_array).to.have.length(1)
    })

    it('waypoint_2_transport_1 fits in one vehicle', async function ()
    {
        const response = await run_with_file('waypoint_2_transport_1.json')
        expect(response.vehicles_array).to.have.length(1)
    })

    it('waypoint_5_transport_1 fits in one vehicle', async function ()
    {
        const response = await run_with_file('waypoint_5_transport_1.json')
        expect(response.vehicles_array).to.have.length(1)
    })

    it('waypoint_2_transport_4 returns four vehicles', async function ()
    {
        const response = await run_with_file('waypoint_2_transport_4.json')
        expect(response.vehicles_array).to.have.length(4)
    })
})
