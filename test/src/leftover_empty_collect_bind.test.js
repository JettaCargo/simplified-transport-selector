const { expect } = require('chai')
const { select_transports } = require('../../src/index')

/**
 * Mirrors the Bi-trem reselection incident: min-weight opens a capable 3/4 truck
 * while the LP still co-loads the light leftover on the Bi-trem, emitting collects:[].
 */
describe('Leftover collect bind onto empty capable truck', function ()
{
    it('does not emit empty collects when a leftover fits the second truck', async function ()
    {
        const response = await select_transports(build_bitrem_leftover_payload())
        expect(response.apiError, JSON.stringify(response)).to.equal(undefined)

        const empty_while_leftover_elsewhere = response.vehicles_array.some(entry =>
            entry.collects.length === 0
            && leftover_bound_elsewhere(response, 'collect_leftover_419'))
        expect(
            empty_while_leftover_elsewhere,
            'must not emit a second vehicle with empty collects while leftovers remain on another truck',
        ).to.equal(false)

        const capable_second = response.vehicles_array.find(
            entry => entry.vehicle.id === 'truck_3_4_3_3t',
        )
        expect(capable_second, 'capable second truck must remain in the selection').to.exist
        const bound_ids = capable_second.collects.map(collect => collect.id)
        expect(bound_ids).to.include('collect_leftover_419')
    })
})

/**
 * @param {object} response selector response
 * @param {string} leftover_collect_id leftover collect id
 * @returns {boolean}
 */
function leftover_bound_elsewhere(response, leftover_collect_id)
{
    return response.vehicles_array.some(entry =>
        entry.collects.some(collect => collect.id === leftover_collect_id))
}

/**
 * @returns {object}
 */
function build_bitrem_leftover_payload()
{
    return {
        config: {
            enable_minimum_required_vehicles: true,
            minimum_required_volume: 0,
            // Forces Bi-trem (38t) + 3/4 (3.3t) capacity while LP still co-loads both collects on Bi-trem.
            minimum_required_supported_weight: 41300,
        },
        gapVolume: 0,
        gapWeight: 0,
        first_criteria: 'AMOUNT',
        second_criteria: 'VOLUME',
        acceptDividedCollect: true,
        log_header: 'cargo/wp-reselection-2',
        collects: [
            {
                id: 'collect_packed',
                order: 0,
                restrictedToVehicles: [],
                items: [build_item('packed', 20000)],
            },
            {
                id: 'collect_leftover_419',
                order: 1,
                restrictedToVehicles: [],
                items: [build_item('leftover', 908)],
            },
        ],
        vehicles: [
            {
                id: 'bitrem_38t',
                name: 'Bi-trem',
                supported_weight: 38000,
                amount: 5,
                unlimited: true,
                cost: 10,
                containers: [{
                    id: 'c1',
                    name: 'c1',
                    sequencia: 1,
                    supported_weight: 38000,
                    length: 14,
                    width: 2.5,
                    height: 2.7,
                }],
            },
            {
                id: 'truck_3_4_3_3t',
                name: 'Caminhao 3/4',
                supported_weight: 3300,
                amount: 5,
                unlimited: true,
                cost: 3,
                containers: [{
                    id: 'c2',
                    name: 'c2',
                    sequencia: 1,
                    supported_weight: 3300,
                    length: 6,
                    width: 2.2,
                    height: 2.2,
                }],
            },
        ],
        accessories: [],
    }
}

/**
 * @param {string} id item id
 * @param {number} weight weight kg
 * @returns {object}
 */
function build_item(id, weight)
{
    return {
        id,
        name: id,
        weight,
        amount: 1,
        volume: 0.01,
        length: 1,
        width: 1,
        height: 0.01,
        supported_weight: 0,
        priority: 0,
        rotations: ['POS1'],
        unlimited: false,
        type: 'Caixa',
        current_rotation: 'POS1',
    }
}
