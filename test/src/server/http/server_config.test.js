const { expect } = require('chai')
const { read_server_config } = require('../../../../build/server/http/server_config')
const { server } = require('../../../../build/server/http/server')

describe('read_server_config', function ()
{
    it('uses the defaults when the environment sets nothing', function ()
    {
        expect(read_server_config({})).to.deep.equal({
            max_body_bytes: 33554432,
            request_timeout_milliseconds: 120000,
            headers_timeout_milliseconds: 60000,
        })
    })

    it('reads overrides and rejects invalid values', function ()
    {
        expect(read_server_config({ MAX_BODY_BYTES: '1024' }).max_body_bytes).to.equal(1024)
        expect(() => read_server_config({ MAX_BODY_BYTES: '0' })).to.throw()
    })

    it('applies the request and header timeouts to the HTTP server', function ()
    {
        expect(server.requestTimeout).to.equal(120000)
        expect(server.headersTimeout).to.equal(60000)
    })
})
