const { expect } = require('chai')
const { should_enable_scaler_heartbeat } = require('../../../../build/heartbeat/config/should_enable_scaler_heartbeat')

describe('should_enable_scaler_heartbeat', function ()
{
    it('enables the heartbeat for the dev and stage environments', function ()
    {
        expect(should_enable_scaler_heartbeat('dev')).to.equal(true)
        expect(should_enable_scaler_heartbeat('stage')).to.equal(true)
    })

    it('disables the heartbeat for production and for a missing environment', function ()
    {
        expect(should_enable_scaler_heartbeat('prod')).to.equal(false)
        expect(should_enable_scaler_heartbeat(undefined)).to.equal(false)
    })
})
