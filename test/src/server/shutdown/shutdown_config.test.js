const { expect } = require('chai')
const { read_shutdown_grace_milliseconds } = require('../../../../build/server/shutdown/shutdown_config')

describe('read_shutdown_grace_milliseconds', function ()
{
    it('defaults to the solver time limit plus its hard-timeout grace', function ()
    {
        expect(read_shutdown_grace_milliseconds({})).to.equal(65000)
    })

    it('reads SHUTDOWN_GRACE_MILLISECONDS and rejects a negative value', function ()
    {
        expect(read_shutdown_grace_milliseconds({ SHUTDOWN_GRACE_MILLISECONDS: '65000' })).to.equal(65000)
        expect(() => read_shutdown_grace_milliseconds({ SHUTDOWN_GRACE_MILLISECONDS: '-1' })).to.throw()
    })
})
