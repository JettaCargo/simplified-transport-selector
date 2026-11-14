const path = require('path')
const { SolverPool } = require('../../build/core/solver/pool/Solver_Pool')

const FAKE_WORKER_PATH = path.join(__dirname, 'fake_solver_worker.js')

/**
 * Builds a pool backed by the fake worker.
 * @param {Partial<import('../../build/core/solver/pool/solver_pool_config').Solver_Pool_Config>} overrides config overrides
 * @returns {SolverPool}
 */
function fake_pool(overrides = {})
{
    return new SolverPool({
        pool_size: 1,
        queue_limit: 0,
        time_limit_seconds: 5,
        hard_timeout_grace_milliseconds: 100,
        worker_max_old_generation_mb: 64,
        ...overrides,
    }, FAKE_WORKER_PATH)
}

/**
 * Settles a promise into a plain outcome object.
 * @param {Promise<unknown>} promise promise
 * @returns {Promise<{ value?: unknown, error?: Error }>}
 */
function settle(promise)
{
    return promise.then(value => ({ value }), error => ({ error }))
}

module.exports = { fake_pool, settle, FAKE_WORKER_PATH }
