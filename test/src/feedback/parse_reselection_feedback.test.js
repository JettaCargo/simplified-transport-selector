const { expect } = require('chai')
const { parse_reselection_feedback } = require('../../../src/feedback/parse_reselection_feedback')

describe('parse_reselection_feedback', function ()
{
    const known_collects = new Set(['collect_a', 'collect_b', 'collect_c'])
    const known_vehicles = new Set(['truck_x', 'truck_y'])

    it('keeps cuts with two or more known collects on a known vehicle', function ()
    {
        const cuts = parse_reselection_feedback({
            failed_co_loads: [
                {
                    vehicle_id: 'truck_x',
                    collect_ids: ['collect_a', 'collect_b', 'ghost'],
                    reason: 'partial_unallocated',
                },
            ],
        }, known_collects, known_vehicles)
        expect(cuts).to.deep.equal([
            { vehicle_id: 'truck_x', collect_ids: ['collect_a', 'collect_b'] },
        ])
    })

    it('drops singleton, unknown vehicle, and empty feedback', function ()
    {
        expect(parse_reselection_feedback(null, known_collects, known_vehicles)).to.deep.equal([])
        expect(parse_reselection_feedback({
            failed_co_loads: [
                { vehicle_id: 'truck_x', collect_ids: ['collect_a'] },
                { vehicle_id: 'missing', collect_ids: ['collect_a', 'collect_b'] },
            ],
        }, known_collects, known_vehicles)).to.deep.equal([])
    })
})
