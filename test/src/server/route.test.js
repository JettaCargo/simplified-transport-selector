const { expect } = require('chai')
const { server } = require('../../../build/server/server')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../build/core/messages/transport_selector_message')
const { send_request, with_listening_server } = require('../../helpers/http_client')

const HEALTH_BODY = 'MS of Transport Selector JettaCargo '
const HEALTH_PATHS = ['/', '/livez', '/readyz']

describe('HTTP routing', function ()
{
    it('answers GET on the health paths with the plain health body', async function ()
    {
        await with_listening_server(server, async port =>
        {
            for (const path of HEALTH_PATHS)
            {
                const response = await send_request(port, { method: 'GET', path })
                expect(response.status, path).to.equal(200)
                expect(response.headers['content-type'], path).to.equal('text/plain')
                expect(response.body, path).to.equal(HEALTH_BODY)
            }
        })
    })

    it('answers GET on an unknown path with 404 and closes the connection', async function ()
    {
        await with_listening_server(server, async port =>
        {
            const response = await send_request(port, { method: 'GET', path: '/missing' })
            expect(response.status).to.equal(404)
            expect(response.body).to.equal('not found')
            expect(response.headers.connection).to.equal('close')
        })
    })

    it('answers POST on an unknown path with 404', async function ()
    {
        await with_listening_server(server, async port =>
        {
            const response = await send_request(port, { method: 'POST', path: '/missing', body: '{}' })
            expect(response.status).to.equal(404)
        })
    })

    it('returns the invalid-JSON catalog error with status 200 for a malformed selection body', async function ()
    {
        await with_listening_server(server, async port =>
        {
            const response = await send_request(port, { method: 'POST', path: '/', body: '{' })
            const body = JSON.parse(response.body)
            expect(response.status).to.equal(200)
            expect(body.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.INVALID_JSON)
            expect(body.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.INVALID_JSON]])
        })
    })
})
