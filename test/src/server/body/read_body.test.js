const { expect } = require('chai')
const { PassThrough } = require('stream')
const { read_body } = require('../../../../build/server/body/read_body')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../build/core/messages/catalog/transport_selector_message')

/**
 * @param {Promise<unknown>} promise promise expected to reject
 * @returns {Promise<string>} catalog key of the rejection
 */
async function rejected_key(promise)
{
    try
    {
        await promise
    }
    catch (error)
    {
        return error.message_entry[0]
    }
    throw new Error('expected a rejection')
}

describe('read_body', function ()
{
    it('returns the whole body when it is within the limit', async function ()
    {
        const request = new PassThrough()
        const body = read_body(request, 10)
        request.end('{"a":1}')
        expect(await body).to.equal('{"a":1}')
    })

    it('rejects with the payload-too-large key as soon as the limit is passed', async function ()
    {
        const request = new PassThrough()
        const body = read_body(request, 4)
        request.write('12345')
        expect(await rejected_key(body)).to.equal(TRANSPORT_SELECTOR_MESSAGE.PAYLOAD_TOO_LARGE)
    })

    it('rejects with the aborted key when the client goes away before the body ends', async function ()
    {
        const request = new PassThrough()
        const body = read_body(request, 100)
        request.write('{"a"')
        request.emit('close')
        expect(await rejected_key(body)).to.equal(TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED)
    })
})
