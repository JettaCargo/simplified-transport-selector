const { expect } = require('chai')
const { select_transports } = require('../../../../../build/index')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')
const { use_env } = require('../../../../helpers/scaler_fixtures')
const SELECTION_PAYLOAD = require('../../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

describe('model size guard', function ()
{
    let restore

    afterEach(function ()
    {
        restore()
    })

    it('rejects a model with more assignment columns than allowed before building it', async function ()
    {
        restore = use_env({ MAX_ASSIGNMENT_COLUMNS: '1' })
        const output = await select_transports(structuredClone(SELECTION_PAYLOAD))
        expect(output.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.MODEL_TOO_LARGE)
        expect(output.messages.errors[0][0]).to.equal(TRANSPORT_SELECTOR_MESSAGE.MODEL_TOO_LARGE)
    })

    it('rejects a model with more constraint rows than allowed before solving it', async function ()
    {
        restore = use_env({ MAX_MODEL_ROWS: '1' })
        const output = await select_transports(structuredClone(SELECTION_PAYLOAD))
        expect(output.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.MODEL_TOO_LARGE)
    })

    it('solves a model within the default limits', async function ()
    {
        restore = use_env({ MAX_ASSIGNMENT_COLUMNS: undefined, MAX_MODEL_ROWS: undefined })
        const output = await select_transports(structuredClone(SELECTION_PAYLOAD))
        expect(output.apiError, JSON.stringify(output)).to.equal(undefined)
    })
})
