const { expect } = require('chai')
const { build_user_active_url } = require('../../../../build/heartbeat/client/build_user_active_url')

describe('build_user_active_url', function ()
{
    it('removes a trailing slash from the scaler base URL', function ()
    {
        expect(build_user_active_url('http://system-scaler:8000/', 'dev'))
            .to.equal('http://system-scaler:8000/user-active?env=dev')
    })

    it('encodes the environment name in the query string', function ()
    {
        expect(build_user_active_url('http://system-scaler:8000', 'a b&c'))
            .to.equal('http://system-scaler:8000/user-active?env=a%20b%26c')
    })
})
