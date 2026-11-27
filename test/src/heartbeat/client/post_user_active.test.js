const { expect } = require('chai')
const { post_user_active } = require('../../../../build/heartbeat/client/post_user_active')
const { start_scaler_stub, use_env } = require('../../../helpers/scaler_fixtures')

describe('post_user_active', function ()
{
    let stub
    let restore_env

    beforeEach(async function ()
    {
        stub = await start_scaler_stub(200)
        restore_env = use_env({ SYSTEM_SCALER_URL: stub.url, ENV: 'dev' })
    })

    afterEach(async function ()
    {
        restore_env()
        await stub.close()
    })

    it('sends one user-active ping for the current environment', async function ()
    {
        await post_user_active()
        expect(stub.requests).to.deep.equal(['/user-active?env=dev'])
    })

    it('rejects when the scaler answers with a client error', async function ()
    {
        const rejecting = await start_scaler_stub(400)
        restore_env()
        restore_env = use_env({ SYSTEM_SCALER_URL: rejecting.url, ENV: 'dev' })
        let thrown
        try
        {
            await post_user_active()
        }
        catch (error)
        {
            thrown = error
        }
        await rejecting.close()
        expect(thrown).to.be.an('error')
    })
})
