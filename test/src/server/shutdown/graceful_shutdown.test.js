const { expect } = require('chai')
const http = require('http')
const path = require('path')
const { graceful_shutdown } = require('../../../../build/server/shutdown/graceful_shutdown')
const { ServiceReadiness } = require('../../../../build/server/health/Service_Readiness')
const { route } = require('../../../../build/server/http/route')
const { SolverPool } = require('../../../../build/core/solver/pool/Solver_Pool')
const { use_shared_solver_pool, close_shared_solver_pool } = require('../../../../build/core/solver/pool/shared_solver_pool')
const { send_request } = require('../../../helpers/http_client')
const { HANG_MARKER } = require('../../../helpers/marker_solver_worker')
const SELECTION_PAYLOAD = require('../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

const MARKER_WORKER_PATH = path.join(__dirname, '../../../helpers/marker_solver_worker.js')

/**
 * @returns {Promise<{ server: http.Server, port: number }>} a fresh listening selector server
 */
async function listening_server()
{
    const server = http.createServer((request, response) => void route(request, response))
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    return { server, port: server.address().port }
}

/**
 * @param {import('../../../../build/core/solver/pool/Solver_Pool').SolverPool} pool solver pool
 * @returns {{ stopped: boolean, stop: () => Promise<void> }} heartbeat stub
 */
function heartbeat_stub()
{
    const heartbeat = { stopped: false, stop: async () => { heartbeat.stopped = true } }
    return heartbeat
}

describe('graceful_shutdown', function ()
{
    let pool

    beforeEach(async function ()
    {
        await close_shared_solver_pool()
        pool = new SolverPool({
            pool_size: 1,
            queue_limit: 1,
            time_limit_seconds: 20,
            hard_timeout_grace_milliseconds: 100,
            worker_max_old_generation_mb: 128,
        }, MARKER_WORKER_PATH)
        use_shared_solver_pool(pool)
    })

    afterEach(async function ()
    {
        await close_shared_solver_pool()
    })

    it('marks the service not ready, lets the in-flight request finish, then stops pool and heartbeat', async function ()
    {
        const { server, port } = await listening_server()
        const readiness = new ServiceReadiness()
        const heartbeat = heartbeat_stub()
        const in_flight = send_request(port, { method: 'POST', path: '/transports_selection', body: JSON.stringify(SELECTION_PAYLOAD) })
        await new Promise(resolve => setTimeout(resolve, 20))
        const shutdown = graceful_shutdown({ server, readiness, pool, heartbeat, grace_milliseconds: 5000 })
        expect(readiness.is_shutting_down()).to.equal(true)
        const response = await in_flight
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.body).vehicles_array).to.be.an('array').that.is.not.empty
        expect(await shutdown).to.equal(true)
        expect(heartbeat.stopped).to.equal(true)
        expect(pool.is_saturated()).to.equal(true)
        expect(server.listening).to.equal(false)
    })

    it('gives up on a solve that outlives the grace period and still stops', async function ()
    {
        const { server, port } = await listening_server()
        const payload = structuredClone(SELECTION_PAYLOAD)
        payload.collects[0].id = `${payload.collects[0].id}_${HANG_MARKER}`
        const in_flight = send_request(port, { method: 'POST', path: '/transports_selection', body: JSON.stringify(payload) })
        await new Promise(resolve => setTimeout(resolve, 50))
        const drained = await graceful_shutdown({ server, readiness: new ServiceReadiness(), pool, heartbeat: heartbeat_stub(), grace_milliseconds: 100 })
        expect(drained).to.equal(false)
        expect(JSON.parse((await in_flight).body).apiError).to.be.a('string')
        expect(server.listening).to.equal(false)
    })
})
