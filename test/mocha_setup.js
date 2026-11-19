/**
 * Mocha preload: set trace-related env before test files load @jetta/tracer via production imports.
 */
process.env.DISABLE_TRACE = process.env.DISABLE_TRACE || 'true'

if (process.env.DISABLE_TRACE !== 'true')
{
    process.env.TRACE_ENV = process.env.TRACE_ENV || 'dev'
    process.env.APP_NAME = process.env.APP_NAME || 'simplified-transport-selector'
    process.env.TRACE_DB_HOST = process.env.TRACE_DB_HOST || '127.0.0.1'
    process.env.TRACE_DB_PASSWORD = process.env.TRACE_DB_PASSWORD || 'test'
}
