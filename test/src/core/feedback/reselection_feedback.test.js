const { expect } = require('chai')
const { select_transports } = require('../../../../build/index')

/**
 * Two light collects that fit together on truck_x by volume/weight,
 * plus a second type so the solver has an escape when a co-load cut is applied.
 * @param {object} [feedback] optional reselection_feedback block
 * @returns {object}
 */
function build_payload(feedback)
{
    const payload = {
        config: {
            enable_minimum_required_vehicles: false,
            minimum_required_volume: 0,
            minimum_required_supported_weight: 0,
        },
        gapVolume: 0,
        gapWeight: 0,
        first_criteria: 'AMOUNT',
        second_criteria: 'VOLUME',
        acceptDividedCollect: true,
        log_header: 'cargo&1/wp-reselection-1',
        collects: [
            {
                id: 'collect_a',
                order: 0,
                restrictedToVehicles: [],
                items: [build_item('a', 1000, 1)],
            },
            {
                id: 'collect_b',
                order: 1,
                restrictedToVehicles: [],
                items: [build_item('b', 1000, 1)],
            },
        ],
        vehicles: [
            {
                id: 'truck_x',
                name: 'Truck X',
                supported_weight: 5000,
                amount: 1,
                unlimited: true,
                cost: 1,
                containers: [{ id: 'cx', name: 'cx', sequencia: 1, supported_weight: 5000, length: 10, width: 2, height: 2 }],
            },
            {
                id: 'truck_y',
                name: 'Truck Y',
                supported_weight: 5000,
                amount: 1,
                unlimited: true,
                cost: 2,
                containers: [{ id: 'cy', name: 'cy', sequencia: 1, supported_weight: 5000, length: 10, width: 2, height: 2 }],
            },
        ],
        accessories: [],
    }
    if (feedback)
        payload.reselection_feedback = feedback
    return payload
}

/**
 * @param {string} id item id
 * @param {number} weight weight
 * @param {number} volume volume
 * @returns {object}
 */
function build_item(id, weight, volume)
{
    return {
        id,
        name: id,
        weight,
        amount: 1,
        volume,
        length: 1,
        width: 1,
        height: volume,
        supported_weight: 0,
        priority: false,
        rotations: ['POS1'],
        unlimited: false,
        type: 'Caixa',
        current_rotation: 'POS1',
    }
}

/**
 * @param {object} output selector output
 * @param {string} collect_id collect id
 * @returns {string[]}
 */
function vehicle_ids_for_collect(output, collect_id)
{
    const ids = []
    for (const entry of output.vehicles_array)
    {
        if (entry.collects.some(collect => collect.id === collect_id))
            ids.push(entry.vehicle.id)
    }
    return ids
}

describe('Reselection bind feedback', function ()
{
    it('without feedback may place both collects on the cheaper truck_x', async function ()
    {
        const output = await select_transports(build_payload())
        expect(output.apiError).to.equal(undefined)
        const a = vehicle_ids_for_collect(output, 'collect_a')
        const b = vehicle_ids_for_collect(output, 'collect_b')
        expect(a).to.include('truck_x')
        expect(b).to.include('truck_x')
    })

    it('failed_co_load on truck_x forbids collect_a and collect_b sharing truck_x', async function ()
    {
        const output = await select_transports(build_payload({
            failed_co_loads: [
                {
                    vehicle_id: 'truck_x',
                    collect_ids: ['collect_a', 'collect_b'],
                    reason: 'partial_unallocated',
                },
            ],
        }))
        expect(output.apiError).to.equal(undefined)
        const a_on_x = vehicle_ids_for_collect(output, 'collect_a').includes('truck_x')
        const b_on_x = vehicle_ids_for_collect(output, 'collect_b').includes('truck_x')
        expect(a_on_x && b_on_x).to.equal(false)
    })

    it('ignores failed_co_load with a single collect id', async function ()
    {
        const output = await select_transports(build_payload({
            failed_co_loads: [
                { vehicle_id: 'truck_x', collect_ids: ['collect_a'], reason: 'partial_unallocated' },
            ],
        }))
        expect(output.apiError).to.equal(undefined)
        expect(output.vehicles_array.length).to.be.at.least(1)
    })

    it('ignores unknown vehicle or collect ids in feedback', async function ()
    {
        const output = await select_transports(build_payload({
            failed_co_loads: [
                { vehicle_id: 'missing_truck', collect_ids: ['collect_a', 'collect_b'], reason: 'partial_unallocated' },
                { vehicle_id: 'truck_x', collect_ids: ['ghost_a', 'ghost_b'], reason: 'partial_unallocated' },
            ],
        }))
        expect(output.apiError).to.equal(undefined)
        expect(output.vehicles_array).to.be.an('array').that.is.not.empty
    })

    it('applies the full compiled failed_co_loads list from prior passes', async function ()
    {
        const output = await select_transports(build_payload({
            failed_co_loads: [
                {
                    vehicle_id: 'truck_x',
                    collect_ids: ['collect_a', 'collect_b'],
                    reason: 'partial_unallocated',
                },
                {
                    vehicle_id: 'truck_y',
                    collect_ids: ['collect_a', 'collect_b'],
                    reason: 'partial_unallocated',
                },
            ],
        }))
        expect(output.apiError).to.equal(undefined)
        const a_on_x = vehicle_ids_for_collect(output, 'collect_a').includes('truck_x')
        const b_on_x = vehicle_ids_for_collect(output, 'collect_b').includes('truck_x')
        const a_on_y = vehicle_ids_for_collect(output, 'collect_a').includes('truck_y')
        const b_on_y = vehicle_ids_for_collect(output, 'collect_b').includes('truck_y')
        expect(a_on_x && b_on_x).to.equal(false)
        expect(a_on_y && b_on_y).to.equal(false)
    })
})
