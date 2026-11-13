const { expect } = require('chai')
const { NoVehicleForGroupException } = require('../../../../build/core/solver/No_Vehicle_For_Group_Exception')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../build/core/messages/transport_selector_message')

describe('NoVehicleForGroupException', function ()
{
    it('carries the group id and the no-vehicle catalog entry', function ()
    {
        const error = new NoVehicleForGroupException('G1')
        expect(error.name).to.equal('NoVehicleForGroupException')
        expect(error.group_id).to.equal('G1')
        expect(error.message_entry).to.deep.equal([TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP, 'G1'])
    })
})
