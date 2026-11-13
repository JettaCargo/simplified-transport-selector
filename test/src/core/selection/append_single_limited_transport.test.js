const { expect } = require('chai')
const { select_transports } = require('../../../../build/index')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../build/core/messages/transport_selector_message')

const VEHICLE_ID = 'truck-1'
const COLLECT_IDS = ['collect-a', 'collect-b']

describe('append single limited transport', function ()
{
    it('attaches every collect when the only vehicle has stock 1', async function ()
    {
        const response = await select_transports(oversized_payload(1))
        expect(response.apiError).to.equal(undefined)
        expect(response.vehicles_array).to.have.length(1)
        expect(collect_ids(response)).to.deep.equal(COLLECT_IDS)
    })

    it('stays infeasible when the same oversized cargo has stock 2', async function ()
    {
        const response = await select_transports(oversized_payload(2))
        expect(response.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS)
        expect(response.msg).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS)
        expect(response.messages.errors[0]).to.deep.equal([TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS, 'Infeasible'])
        expect(response.vehicles_array).to.equal(undefined)
    })
})

/**
 * Two collects that each fit one truck, together larger than one truck,
 * with a minimum volume that also exceeds two trucks.
 * @param {number} amount limited stock
 * @returns {object}
 */
function oversized_payload(amount)
{
    return {
        gapWeight: 0,
        gapVolume: 0,
        accessories: [],
        acceptDividedCollect: true,
        vehicles: [vehicle(amount)],
        collects: [
            collect(COLLECT_IDS[0]),
            collect(COLLECT_IDS[1]),
        ],
        config: {
            enable_minimum_required_vehicles: true,
            minimum_required_volume: 30,
            minimum_required_supported_weight: 0,
        },
    }
}

/**
 * @param {number} amount limited stock
 * @returns {object}
 */
function vehicle(amount)
{
    return {
        id: VEHICLE_ID,
        name: 'Truck',
        amount,
        unlimited: false,
        cost: 0,
        supported_weight: 1000,
        containers: [{
            id: '0',
            name: 'Container 0',
            sequencia: 1,
            supported_weight: 1000,
            length: 2,
            width: 2,
            height: 2.5,
        }],
    }
}

/**
 * @param {string} id collect id
 * @returns {object}
 */
function collect(id)
{
    return {
        id,
        order: 0,
        restrictedToVehicles: [],
        items: [{
            id: '0',
            name: 'Box',
            amount: 1,
            unlimited: false,
            weight: 1,
            volume: 6,
            length: 1,
            width: 1,
            height: 1,
            supported_weight: 1000,
            rotations: ['POS1'],
            current_rotation: 'POS1',
            type: 'Caixa',
        }],
    }
}

/**
 * @param {object} response selector response
 * @returns {string[]}
 */
function collect_ids(response)
{
    return response.vehicles_array[0].collects.map(collect_entry => collect_entry.id)
}
