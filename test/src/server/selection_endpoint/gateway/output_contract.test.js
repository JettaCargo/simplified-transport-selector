const { expect } = require('chai')
const { select_transports } = require('../../../../../build/index')
const { error_response_from_unknown } = require('../../../../../build/server/errors/error_response_from_unknown')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')
const SELECTION_PAYLOAD = require('../../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

/**
 * @param {object} envelope error body
 */
function expect_error_envelope_shape(envelope)
{
    expect(Object.keys(envelope).sort()).to.deep.equal(['apiError', 'messages', 'msg'])
    expect(envelope.msg).to.equal(envelope.apiError)
    expect(Object.keys(envelope.messages).sort()).to.deep.equal(['errors', 'infos', 'warnings'])
    expect(envelope.messages.errors[0][0]).to.equal(envelope.apiError)
    expect(envelope.messages.warnings).to.deep.equal([])
    expect(envelope.messages.infos).to.deep.equal([])
}

describe('gateway output contract', function ()
{
    it('keeps the success body to vehicles_array entries with vehicle and collect ids', async function ()
    {
        const output = await select_transports(structuredClone(SELECTION_PAYLOAD))
        expect(Object.keys(output)).to.deep.equal(['vehicles_array'])
        for (const entry of output.vehicles_array)
        {
            expect(entry.vehicle.id).to.be.a('string')
            expect(entry.collects).to.be.an('array').that.is.not.empty
            for (const collect of entry.collects)
                expect(collect.id).to.be.a('string')
        }
    })

    it('keeps the catalog error envelope shape for catalog and internal errors', function ()
    {
        expect_error_envelope_shape(error_response_from_unknown({ message_entry: [TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP, 'G1'] }))
        expect_error_envelope_shape(error_response_from_unknown(new Error('boom')))
    })
})
