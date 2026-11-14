const { expect } = require('chai')
const { server } = require('../../../../build/server/http/server')
const { use_shared_solver_pool, close_shared_solver_pool } = require('../../../../build/core/solver/pool/shared_solver_pool')
const { send_request, with_listening_server } = require('../../../helpers/http_client')
const { fake_pool, settle } = require('../../../helpers/solver_pool_fixtures')

describe('readiness probe', function ()
{
    beforeEach(async function ()
    {
        await close_shared_solver_pool()
        use_shared_solver_pool(fake_pool({ pool_size: 1, queue_limit: 0 }))
    })

    afterEach(async function ()
    {
        await close_shared_solver_pool()
    })

    it('answers 503 on /readyz while the solver pool cannot take another job, and 200 on /livez', async function ()
    {
        const { shared_solver_pool } = require('../../../../build/core/solver/pool/shared_solver_pool')
        await with_listening_server(server, async port =>
        {
            const running = settle(shared_solver_pool().solve('sleep:200'))
            expect((await send_request(port, { method: 'GET', path: '/readyz' })).status).to.equal(503)
            expect((await send_request(port, { method: 'GET', path: '/livez' })).status).to.equal(200)
            expect((await send_request(port, { method: 'GET', path: '/' })).status).to.equal(200)
            await running
            expect((await send_request(port, { method: 'GET', path: '/readyz' })).status).to.equal(200)
        })
    })
})
