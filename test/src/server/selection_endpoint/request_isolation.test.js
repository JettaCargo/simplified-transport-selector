const { expect } = require('chai')
const http = require('http')
const path = require('path')
const { server } = require('../../../../build/server/http/server')
const { SolverPool } = require('../../../../build/core/solver/pool/Solver_Pool')
const { use_shared_solver_pool, close_shared_solver_pool } = require('../../../../build/core/solver/pool/shared_solver_pool')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../build/core/messages/catalog/transport_selector_message')
const { send_request, with_listening_server } = require('../../../helpers/http_client')
const { HANG_MARKER, CRASH_MARKER } = require('../../../helpers/marker_solver_worker')
const SELECTION_PAYLOAD = require('../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

const MARKER_WORKER_PATH = path.join(__dirname, '../../../helpers/marker_solver_worker.js')

/**
 * @param {string} marker text that makes the marker worker misbehave
 * @returns {object} selection payload whose first collect id carries the marker
 */
function marked_payload(marker)
{
    const payload = structuredClone(SELECTION_PAYLOAD)
    payload.collects[0].id = `${payload.collects[0].id}_${marker}`
    return payload
}

/**
 * @param {number} port server port
 * @param {object} payload selection payload
 * @returns {Promise<object>} parsed response body
 */
async function post_selection(port, payload)
{
    const response = await send_request(port, { method: 'POST', path: '/transports_selection', body: JSON.stringify(payload) })
    expect(response.status).to.equal(200)
    return JSON.parse(response.body)
}

describe('request isolation over HTTP', function ()
{
    beforeEach(async function ()
    {
        await close_shared_solver_pool()
        use_shared_solver_pool(new SolverPool({
            pool_size: 2,
            queue_limit: 2,
            time_limit_seconds: 0.5,
            hard_timeout_grace_milliseconds: 100,
            worker_max_old_generation_mb: 128,
        }, MARKER_WORKER_PATH))
    })

    afterEach(async function ()
    {
        await close_shared_solver_pool()
    })

    it('keeps liveness and a concurrent request working while another solve hangs', async function ()
    {
        await with_listening_server(server, async port =>
        {
            const hanging = post_selection(port, marked_payload(HANG_MARKER))
            const started = Date.now()
            const liveness = await send_request(port, { method: 'GET', path: '/livez' })
            expect(liveness.status).to.equal(200)
            expect(Date.now() - started).to.be.below(200)
            const neighbor = await post_selection(port, SELECTION_PAYLOAD)
            expect(neighbor.apiError, JSON.stringify(neighbor)).to.equal(undefined)
            expect(neighbor.vehicles_array).to.be.an('array').that.is.not.empty
            expect((await hanging).apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT)
        })
    })

    it('frees the worker of a request whose client disconnected mid-solve', async function ()
    {
        await close_shared_solver_pool()
        use_shared_solver_pool(new SolverPool({
            pool_size: 1,
            queue_limit: 1,
            time_limit_seconds: 20,
            hard_timeout_grace_milliseconds: 100,
            worker_max_old_generation_mb: 128,
        }, MARKER_WORKER_PATH))
        await with_listening_server(server, async port =>
        {
            const abandoned = http.request({ hostname: '127.0.0.1', port, path: '/transports_selection', method: 'POST' })
            abandoned.on('error', () => undefined)
            abandoned.end(JSON.stringify(marked_payload(HANG_MARKER)))
            await new Promise(resolve => setTimeout(resolve, 150))
            abandoned.destroy()
            const started = Date.now()
            const neighbor = await post_selection(port, SELECTION_PAYLOAD)
            expect(neighbor.apiError, JSON.stringify(neighbor)).to.equal(undefined)
            expect(Date.now() - started).to.be.below(3000)
        })
    })

    it('fails only the request whose solver crashed', async function ()
    {
        await with_listening_server(server, async port =>
        {
            const [crashed, neighbor] = await Promise.all([
                post_selection(port, marked_payload(CRASH_MARKER)),
                post_selection(port, SELECTION_PAYLOAD),
            ])
            expect(crashed.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH)
            expect(crashed.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH]])
            expect(neighbor.apiError, JSON.stringify(neighbor)).to.equal(undefined)
            const after = await post_selection(port, SELECTION_PAYLOAD)
            expect(after.apiError, JSON.stringify(after)).to.equal(undefined)
        })
    })
})
