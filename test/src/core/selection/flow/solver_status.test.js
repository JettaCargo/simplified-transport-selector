const { expect } = require('chai')
const path = require('path')
const { select_transports } = require('../../../../../build/index')
const { SolverPool } = require('../../../../../build/core/solver/pool/Solver_Pool')
const { use_shared_solver_pool, close_shared_solver_pool } = require('../../../../../build/core/solver/pool/shared_solver_pool')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')
const { use_env } = require('../../../../helpers/scaler_fixtures')
const SELECTION_PAYLOAD = require('../../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

const STATUS_WORKER_PATH = path.join(__dirname, '../../../../helpers/status_override_solver_worker.js')

/**
 * @param {Record<string, string | undefined>} environment worker environment overrides
 * @returns {Promise<object>} selector output solved by a status-overriding worker
 */
async function select_with_worker_environment(environment)
{
    const restore = use_env(environment)
    try
    {
        await close_shared_solver_pool()
        use_shared_solver_pool(new SolverPool({
            pool_size: 1,
            queue_limit: 1,
            time_limit_seconds: 5,
            hard_timeout_grace_milliseconds: 500,
            worker_max_old_generation_mb: 128,
        }, STATUS_WORKER_PATH))
        return await select_transports(structuredClone(SELECTION_PAYLOAD))
    }
    finally
    {
        restore()
        await close_shared_solver_pool()
    }
}

describe('solver status handling', function ()
{
    it('rejects an OptimalInfeas result with the solver-status key', async function ()
    {
        const output = await select_with_worker_environment({ STATUS_OVERRIDE: 'OptimalInfeas' })
        expect(output.messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS, 'OptimalInfeas']])
    })

    it('reports the time-limit key when the time limit hit before any incumbent', async function ()
    {
        const output = await select_with_worker_environment({ STATUS_OVERRIDE: 'Time limit reached', DROP_COLUMNS: '1' })
        expect(output.apiError).to.equal(TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT)
    })

    it('packs the incumbent of a time-limited solve', async function ()
    {
        const output = await select_with_worker_environment({ STATUS_OVERRIDE: 'Time limit reached' })
        expect(output.apiError, JSON.stringify(output)).to.equal(undefined)
        expect(output.vehicles_array).to.be.an('array').that.is.not.empty
    })
})
