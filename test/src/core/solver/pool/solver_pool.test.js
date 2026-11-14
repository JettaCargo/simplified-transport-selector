const { expect } = require('chai')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')
const { fake_pool, settle } = require('../../../../helpers/solver_pool_fixtures')

/**
 * @param {Error | undefined} error rejection
 * @returns {string | undefined} catalog key carried by the error
 */
function key_of(error)
{
    return error && error.message_entry && error.message_entry[0]
}

describe('SolverPool', function ()
{
    let pool

    afterEach(async function ()
    {
        await pool.close()
    })

    it('returns the worker result for a job', async function ()
    {
        pool = fake_pool()
        const result = await pool.solve('sleep:1')
        expect(result.Status).to.equal('Optimal')
    })

    it('runs as many jobs at once as there are workers', async function ()
    {
        pool = fake_pool({ pool_size: 2 })
        await Promise.all([pool.solve('sleep:1'), pool.solve('sleep:1')])
        const started = Date.now()
        await Promise.all([pool.solve('sleep:150'), pool.solve('sleep:150')])
        expect(Date.now() - started).to.be.below(280)
    })

    it('queues a job until a worker frees up', async function ()
    {
        pool = fake_pool({ queue_limit: 1 })
        const outcomes = await Promise.all([settle(pool.solve('sleep:50')), settle(pool.solve('sleep:1'))])
        expect(outcomes.map(outcome => outcome.value.Status)).to.deep.equal(['Optimal', 'Optimal'])
    })

    it('reports how long a queued job waited and how long it solved', async function ()
    {
        pool = fake_pool({ queue_limit: 1 })
        const timings = []
        const running = pool.solve('sleep:80')
        await pool.solve('sleep:40', { on_timing: timing => timings.push(timing) })
        await running
        expect(timings).to.have.length(1)
        expect(timings[0].queue_wait_milliseconds).to.be.at.least(60)
        expect(timings[0].solve_milliseconds).to.be.at.least(30)
    })

    it('rejects with the busy key when every worker is busy and the queue is full', async function ()
    {
        pool = fake_pool()
        const running = settle(pool.solve('sleep:100'))
        const rejected = await settle(pool.solve('sleep:1'))
        expect(key_of(rejected.error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY)
        expect((await running).value.Status).to.equal('Optimal')
    })

    it('reports saturation only while every worker is busy and the queue is full', async function ()
    {
        pool = fake_pool()
        expect(pool.is_saturated()).to.equal(false)
        const running = pool.solve('sleep:50')
        expect(pool.is_saturated()).to.equal(true)
        await running
        expect(pool.is_saturated()).to.equal(false)
    })

    it('terminates a job past its hard deadline and keeps serving the next one', async function ()
    {
        pool = fake_pool({ time_limit_seconds: 0.05, hard_timeout_grace_milliseconds: 50 })
        const timed_out = await settle(pool.solve('hang'))
        expect(key_of(timed_out.error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT)
        expect((await pool.solve('sleep:1')).Status).to.equal('Optimal')
    })

    it('fails only the job whose worker crashed and replaces that worker', async function ()
    {
        pool = fake_pool({ pool_size: 2 })
        const [crashed, neighbor] = await Promise.all([settle(pool.solve('crash')), settle(pool.solve('sleep:100'))])
        expect(key_of(crashed.error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH)
        expect(neighbor.value.Status).to.equal('Optimal')
        const after = await Promise.all([pool.solve('sleep:1'), pool.solve('sleep:1')])
        expect(after).to.have.length(2)
    })

    it('maps an error thrown inside the worker to the crash key', async function ()
    {
        pool = fake_pool()
        const failed = await settle(pool.solve('throw'))
        expect(key_of(failed.error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH)
        expect((await pool.solve('sleep:1')).Status).to.equal('Optimal')
    })

    it('removes an aborted job from the queue without touching the running one', async function ()
    {
        pool = fake_pool({ queue_limit: 1 })
        const controller = new AbortController()
        const running = settle(pool.solve('sleep:100'))
        const queued = settle(pool.solve('sleep:1', { signal: controller.signal }))
        controller.abort()
        expect(key_of((await queued).error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED)
        expect((await running).value.Status).to.equal('Optimal')
    })

    it('terminates the worker of an aborted running job and serves the next job', async function ()
    {
        pool = fake_pool()
        const controller = new AbortController()
        const running = settle(pool.solve('hang', { signal: controller.signal }))
        setTimeout(() => controller.abort(), 20)
        expect(key_of((await running).error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED)
        expect((await pool.solve('sleep:1')).Status).to.equal('Optimal')
    })

    it('rejects a job whose signal is already aborted', async function ()
    {
        pool = fake_pool()
        const failed = await settle(pool.solve('sleep:1', { signal: AbortSignal.abort() }))
        expect(key_of(failed.error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.REQUEST_ABORTED)
    })

    it('passes the smaller of the configured and requested time limit to the worker', async function ()
    {
        pool = fake_pool({ time_limit_seconds: 5 })
        expect((await pool.solve('echo_time_limit', { time_limit_seconds: 2 })).time_limit_seconds).to.equal(2)
        expect((await pool.solve('echo_time_limit', { time_limit_seconds: 9 })).time_limit_seconds).to.equal(5)
    })

    it('counts jobs in flight and drains them', async function ()
    {
        pool = fake_pool({ queue_limit: 1 })
        const jobs = [pool.solve('sleep:30'), pool.solve('sleep:30')]
        expect(pool.in_flight()).to.equal(2)
        expect(await pool.drain(1000)).to.equal(true)
        expect(pool.in_flight()).to.equal(0)
        await Promise.all(jobs)
    })

    it('rejects queued jobs and new jobs after close', async function ()
    {
        pool = fake_pool({ queue_limit: 1 })
        const running = settle(pool.solve('hang'))
        const queued = settle(pool.solve('sleep:1'))
        await pool.close()
        expect(key_of((await running).error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY)
        expect(key_of((await queued).error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY)
        expect(key_of((await settle(pool.solve('sleep:1'))).error)).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_BUSY)
    })
})
