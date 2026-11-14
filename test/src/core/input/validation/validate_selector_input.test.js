const { expect } = require('chai')
const { parse_request } = require('../../../../../build/core/input/request/parse_request')
const { SelectorInputException } = require('../../../../../build/core/input/validation/Selector_Input_Exception')
const { ROTATION, TRANSPORT_CHOICE_CRITERIA } = require('../../../../../build/core/input/schema/selector_input_vocabulary')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')

describe('validate selector input', function ()
{
    it('reads item fields, accessories, and config from a valid payload', function ()
    {
        const request = parse_request(valid_payload())
        const item = request.groups[0].items[0]
        expect(request.first_criteria).to.equal(TRANSPORT_CHOICE_CRITERIA.AMOUNT)
        expect(request.second_criteria).to.equal(TRANSPORT_CHOICE_CRITERIA.DISABLED)
        expect(request.config.single_waypoint_per_transport).to.equal(true)
        expect(request.accessories).to.have.length(1)
        expect(item.priority).to.equal(false)
        expect(item.type).to.equal('Caixa')
        expect(item.unlimited).to.equal(false)
        expect(item.current_rotation).to.equal(ROTATION.POS1)
        expect(item.rotations).to.deep.equal([ROTATION.POS1, ROTATION.POS4])
    })

    it('defaults a missing unlimited flag to true', function ()
    {
        const payload = valid_payload()
        delete payload.vehicles[0].unlimited
        const request = parse_request(payload)
        expect(request.vehicles[0].unlimited).to.equal(true)
        expect(request.vehicles[0].stock).to.equal(null)
    })

    it('drops items whose amount is below 1', function ()
    {
        const payload = valid_payload()
        payload.collects[0].items.push(item('zero', 0))
        const request = parse_request(payload)
        expect(request.groups[0].items.map(entry => entry.id)).to.deep.equal(['box'])
    })

    it('uses the vehicle as its container when containers is absent', function ()
    {
        const payload = valid_payload()
        delete payload.vehicles[0].containers
        payload.vehicles[0].width = 2
        payload.vehicles[0].length = 3
        payload.vehicles[0].height = 4
        const request = parse_request(payload)
        expect(request.vehicles[0].containers).to.have.length(1)
        expect(request.vehicles[0].containers[0].id).to.equal('truck-1')
        expect(request.vehicles[0].volume).to.equal(24)
    })

    it('keeps the first vehicle when ids repeat', function ()
    {
        const payload = valid_payload()
        payload.vehicles.push({ ...payload.vehicles[0], name: 'Other', supported_weight: 1 })
        const request = parse_request(payload)
        expect(request.vehicles).to.have.length(1)
        expect(request.vehicles[0].name).to.equal('Truck')
    })

    it('rejects a missing config', function ()
    {
        const payload = valid_payload()
        delete payload.config
        expect(() => parse_request(payload)).to.throw(SelectorInputException)
        try
        {
            parse_request(payload)
        }
        catch (error)
        {
            expect(error.message).to.equal(TRANSPORT_SELECTOR_MESSAGE.INVALID_FIELD)
            expect(error.message_entry[1]).to.match(/config/)
        }
    })

    it('rejects an unknown rotation', function ()
    {
        const payload = valid_payload()
        payload.collects[0].items[0].current_rotation = 'POS9'
        expect(() => parse_request(payload)).to.throw(SelectorInputException)
        try
        {
            parse_request(payload)
        }
        catch (error)
        {
            expect(error.message).to.equal(TRANSPORT_SELECTOR_MESSAGE.INVALID_FIELD)
            expect(error.message_entry[1]).to.match(/current_rotation/)
        }
    })
})

/**
 * @returns {object}
 */
function valid_payload()
{
    return {
        gapWeight: 0,
        gapVolume: 0,
        first_criteria: 'amount',
        log_header: 'cargo-1',
        sortByWeight: false,
        config: {
            minimum_required_volume: 1,
            single_waypoint_per_transport: true,
        },
        accessories: [item('accessory', 1)],
        vehicles: [vehicle()],
        collects: [{
            id: 'collect-a',
            restrictedToVehicles: [],
            items: [item('box', 1)],
        }],
    }
}

/**
 * @returns {object}
 */
function vehicle()
{
    return {
        id: 'truck-1',
        name: 'Truck',
        supported_weight: 1000,
        amount: 1,
        unlimited: false,
        containers: [{
            id: '0',
            name: 'Container 0',
            supported_weight: 1000,
            width: 2,
            length: 2,
            height: 2,
            sequencia: 1,
        }],
    }
}

/**
 * @param {string} id item id
 * @param {number} amount amount
 * @returns {object}
 */
function item(id, amount)
{
    return {
        id,
        name: id,
        weight: 1,
        amount,
        width: 1,
        length: 1,
        height: 1,
        current_rotation: 'POS1',
        rotations: ['POS1', 'POS4'],
        type: 'Caixa',
        priority: 0,
    }
}
