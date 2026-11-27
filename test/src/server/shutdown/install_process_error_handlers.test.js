const { expect } = require('chai')
const { EventEmitter } = require('events')
const { install_process_error_handlers } = require('../../../../build/server/shutdown/install_process_error_handlers')

/**
 * @returns {EventEmitter & { exit_codes: number[], exit: (code: number) => void }} process stand-in
 */
function fake_process()
{
    const target = new EventEmitter()
    target.exit_codes = []
    target.exit = code => target.exit_codes.push(code)
    return target
}

describe('install_process_error_handlers', function ()
{
    it('logs and exits non-zero on an uncaught exception', function ()
    {
        const target = fake_process()
        const logged = []
        install_process_error_handlers(target, { error: (...args) => logged.push(args.join(' ')) })
        target.emit('uncaughtException', new Error('kaboom'))
        expect(target.exit_codes).to.deep.equal([1])
        expect(logged.join('\n')).to.include('kaboom')
    })

    it('logs and exits non-zero on an unhandled rejection', function ()
    {
        const target = fake_process()
        const logged = []
        install_process_error_handlers(target, { error: (...args) => logged.push(args.join(' ')) })
        target.emit('unhandledRejection', 'rejected value')
        expect(target.exit_codes).to.deep.equal([1])
        expect(logged.join('\n')).to.include('rejected value')
    })
})
