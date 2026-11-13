const { expect } = require('chai')
const { error_response_from_unknown } = require('../../../build/server/error_response_from_unknown')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../build/core/messages/transport_selector_message')

describe('error_response_from_unknown', function ()
{
    it('maps a catalog error to its key and parameters', function ()
    {
        const error = { message_entry: [TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP, 'G1'] }
        const envelope = error_response_from_unknown(error)
        expect(envelope.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP)
        expect(envelope.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP, 'G1']])
    })

    it('wraps an Error message as the items-dont-fit detail', function ()
    {
        const envelope = error_response_from_unknown(new Error('boom'))
        expect(envelope.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.ITEMS_DONT_FIT)
        expect(envelope.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.ITEMS_DONT_FIT, 'boom']])
    })

    it('stringifies a thrown value that is not a catalog error or an Error', function ()
    {
        const envelope = error_response_from_unknown('oops')
        expect(envelope.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.ITEMS_DONT_FIT, 'oops']])
    })

    it('falls back to the generic key for objects whose message_entry is not a catalog tuple', function ()
    {
        const values = [null, { message_entry: 'not-a-tuple' }, { message_entry: [1] }]
        for (const value of values)
            expect(error_response_from_unknown(value).apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.ITEMS_DONT_FIT)
    })
})
