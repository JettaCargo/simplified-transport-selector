const { expect } = require('chai')
const { read_solver_pool_config } = require('../../../../../build/core/solver/pool/solver_pool_config')

describe('read_solver_pool_config', function ()
{
    it('uses the defaults when the environment sets nothing', function ()
    {
        expect(read_solver_pool_config({})).to.deep.equal({
            pool_size: 2,
            queue_limit: 4,
            time_limit_seconds: 60,
            hard_timeout_grace_milliseconds: 5000,
            worker_max_old_generation_mb: 256,
        })
    })

    it('reads numeric overrides from the environment', function ()
    {
        const config = read_solver_pool_config({
            SOLVER_POOL_SIZE: '3',
            SOLVER_QUEUE_LIMIT: '0',
            SOLVER_TIME_LIMIT_SECONDS: '12.5',
            SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS: '250',
            SOLVER_WORKER_MAX_OLD_GENERATION_MB: '128',
        })
        expect(config).to.deep.equal({
            pool_size: 3,
            queue_limit: 0,
            time_limit_seconds: 12.5,
            hard_timeout_grace_milliseconds: 250,
            worker_max_old_generation_mb: 128,
        })
    })

    it('rejects invalid values instead of starting a misconfigured pool', function ()
    {
        const invalid = [{ SOLVER_POOL_SIZE: '0' }, { SOLVER_QUEUE_LIMIT: '-1' }, { SOLVER_TIME_LIMIT_SECONDS: 'abc' }]
        for (const environment of invalid)
            expect(() => read_solver_pool_config(environment), JSON.stringify(environment)).to.throw()
    })
})
