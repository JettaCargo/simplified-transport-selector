const { expect } = require('chai')
const { run_with_file } = require('../helpers/run_from_payload')

const ITEMS_DONT_FIT_MESSAGE = 'itens que não cabem em nenhum dos transportes informados'

describe('TransportRestrictions (from Java FromPayload)', function ()
{
    it('waypoint_5_restriction_1_transport_1 is impossible', async function ()
    {
        const response = await run_with_file('waypoint_5_restriction_1_transport_1.json')
        expect(response.msg).to.include(ITEMS_DONT_FIT_MESSAGE)
    })

    it('cant_carry_items_because_of_weight returns fit error', async function ()
    {
        const response = await run_with_file('cant_carry_items_raising_nullpointer.json')
        expect(response.msg).to.include(ITEMS_DONT_FIT_MESSAGE)
    })

    it('waypoint_5_restriction_1_transport_2 chooses the unrestricted vehicle', async function ()
    {
        const response = await run_with_file('waypoint_5_restriction_1_transport_2.json')
        expect(response.vehicles_array).to.have.length(1)
        expect(response.vehicles_array[0].vehicle.id).to.equal('vehicle_2')
    })

    it('waypoint_5_restriction_2_transport_2 needs both vehicles', async function ()
    {
        const response = await run_with_file('waypoint_5_restriction_2_transport_2.json')
        expect(response.vehicles_array).to.have.length(2)
        const ids = response.vehicles_array.map(entry => entry.vehicle.id)
        expect(new Set(ids).size).to.equal(2)
    })

    it('restricted_to_all_waypoints never picks the blacklisted type', async function ()
    {
        const response = await run_with_file('restricted_to_all_waypoints.json')
        for (const entry of response.vehicles_array)
            expect(entry.vehicle.id).to.not.equal('5f75b3a1b32993001150ad23')
    })

    it('correct_waypoint_choice keeps reference waypoint on reference vehicle', async function ()
    {
        const response = await run_with_file('DEV-3715.json')
        for (const entry of response.vehicles_array)
        {
            const has_reference = entry.collects.some(collect => collect.id === 'reference_waypoint')
            if (has_reference)
                expect(entry.vehicle.id).to.equal('reference_vehicle')
        }
    })

    it('single_waypoint_per_transport emits two clones with both waypoints', async function ()
    {
        const response = await run_with_file('basic_single_waypoint_per_transport.json')
        expect(response.vehicles_array).to.have.length(2)
        for (const entry of response.vehicles_array)
            expect(entry.collects).to.have.length(2)
    })

    it('single_waypoint_per_transport_inverse_test avoids singleton collects', async function ()
    {
        const response = await run_with_file('basic_multi_waypoint_per_transport.json')
        for (const entry of response.vehicles_array)
            expect(entry.collects.length).to.not.equal(1)
    })
})
