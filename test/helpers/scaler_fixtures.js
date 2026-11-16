const http = require('http')

/**
 * Starts a local HTTP stub that records the path of every request it receives.
 * @param {number} status status code returned to every request
 * @returns {Promise<{ url: string, requests: string[], close: () => Promise<void> }>}
 */
function start_scaler_stub(status = 200)
{
    const requests = []
    const stub = http.createServer((request, response) =>
    {
        requests.push(request.url)
        response.writeHead(status)
        response.end()
    })
    return new Promise(resolve => stub.listen(0, '127.0.0.1', () =>
    {
        const { port } = stub.address()
        resolve({
            url: `http://127.0.0.1:${port}`,
            requests,
            close: () => new Promise(done => stub.close(done)),
        })
    }))
}

/**
 * Overrides process environment variables and returns a function that restores them.
 * @param {Record<string, string | undefined>} overrides variables to set; undefined removes them
 * @returns {() => void} restore function
 */
function use_env(overrides)
{
    const previous = {}
    for (const key of Object.keys(overrides))
    {
        previous[key] = process.env[key]
        apply_value(key, overrides[key])
    }
    return () =>
    {
        for (const key of Object.keys(previous))
            apply_value(key, previous[key])
    }
}

/**
 * @param {string} key variable name
 * @param {string | undefined} value value, or undefined to remove it
 */
function apply_value(key, value)
{
    if (value === undefined)
        delete process.env[key]
    else
        process.env[key] = value
}

/**
 * Polls until the predicate holds or the timeout elapses.
 * @param {() => boolean} predicate condition to wait for
 * @param {number} timeout_milliseconds maximum wait
 * @returns {Promise<void>}
 */
async function wait_for(predicate, timeout_milliseconds = 2000)
{
    const deadline = Date.now() + timeout_milliseconds
    while (!predicate())
    {
        if (Date.now() > deadline)
            throw new Error('condition not met before timeout')
        await new Promise(resolve => setTimeout(resolve, 5))
    }
}

module.exports = { start_scaler_stub, use_env, wait_for }
