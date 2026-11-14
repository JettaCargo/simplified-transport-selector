const { expect } = require('chai')
const { start_scaler_http_heartbeat } = require('../../../../build/heartbeat/runner/start_scaler_http_heartbeat')
const { start_scaler_stub, use_env, wait_for } = require('../../../helpers/scaler_fixtures')

describe('start_scaler_http_heartbeat', function ()
{
    let stub
    let restore_env

    beforeEach(async function ()
    {
        stub = await start_scaler_stub(200)
    })

    afterEach(async function ()
    {
        restore_env()
        await stub.close()
    })

    it('returns an inert handle and sends nothing outside dev and stage', async function ()
    {
        restore_env = use_env({ SYSTEM_SCALER_URL: stub.url, ENV: 'prod' })
        const handle = start_scaler_http_heartbeat({ interval_milliseconds: 20 })
        await handle.stop()
        await new Promise(resolve => setTimeout(resolve, 40))
        expect(stub.requests).to.deep.equal([])
    })

    it('pings the scaler in dev using the default interval when no options are given', async function ()
    {
        restore_env = use_env({ SYSTEM_SCALER_URL: stub.url, ENV: 'dev' })
        const handle = start_scaler_http_heartbeat()
        await wait_for(() => stub.requests.length >= 1)
        await handle.stop()
        expect(stub.requests[0]).to.equal('/user-active?env=dev')
    })

    it('uses the interval passed in options', async function ()
    {
        restore_env = use_env({ SYSTEM_SCALER_URL: stub.url, ENV: 'stage' })
        const handle = start_scaler_http_heartbeat({ interval_milliseconds: 20 })
        await wait_for(() => stub.requests.length >= 2)
        await handle.stop()
        expect(stub.requests[0]).to.equal('/user-active?env=stage')
    })
})
