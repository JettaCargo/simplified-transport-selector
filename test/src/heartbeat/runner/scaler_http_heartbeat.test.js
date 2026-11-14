const { expect } = require('chai')
const { ScalerHttpHeartbeat } = require('../../../../build/heartbeat/runner/Scaler_Http_Heartbeat')
const { start_scaler_stub, use_env, wait_for } = require('../../../helpers/scaler_fixtures')

const LONG_INTERVAL_MILLISECONDS = 60000

describe('ScalerHttpHeartbeat', function ()
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

    it('posts a ping when beat is called while running', async function ()
    {
        const heartbeat = new ScalerHttpHeartbeat(LONG_INTERVAL_MILLISECONDS)
        await heartbeat.beat()
        await heartbeat.stop()
        expect(stub.requests).to.deep.equal(['/user-active?env=dev'])
    })

    it('sends nothing once stopped', async function ()
    {
        const heartbeat = new ScalerHttpHeartbeat(LONG_INTERVAL_MILLISECONDS)
        await heartbeat.stop()
        await heartbeat.beat()
        expect(stub.requests).to.deep.equal([])
    })

    it('resolves without throwing when the scaler is unreachable', async function ()
    {
        const unreachable = await start_scaler_stub(200)
        const url = unreachable.url
        await unreachable.close()
        restore_env()
        restore_env = use_env({ SYSTEM_SCALER_URL: url, ENV: 'dev' })
        const heartbeat = new ScalerHttpHeartbeat(LONG_INTERVAL_MILLISECONDS)
        await heartbeat.beat()
        await heartbeat.stop()
    })

    it('beats on start and then on each interval until stopped', async function ()
    {
        const heartbeat = new ScalerHttpHeartbeat(20).start()
        await wait_for(() => stub.requests.length >= 2)
        await heartbeat.stop()
        const count_at_stop = stub.requests.length
        await new Promise(resolve => setTimeout(resolve, 80))
        expect(stub.requests.length).to.equal(count_at_stop)
    })

    it('stops cleanly when it was never started', async function ()
    {
        const heartbeat = new ScalerHttpHeartbeat(LONG_INTERVAL_MILLISECONDS)
        await heartbeat.stop()
        expect(stub.requests).to.deep.equal([])
    })
})
