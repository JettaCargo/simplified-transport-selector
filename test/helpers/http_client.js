const http = require('http')

/**
 * Sends one HTTP request to a local port and collects the full response.
 * @param {number} port port on 127.0.0.1
 * @param {{ method: string, path: string, body?: string }} request request description
 * @returns {Promise<{ status: number, headers: object, body: string }>}
 */
function send_request(port, request)
{
    const body = request.body || ''
    return new Promise((resolve, reject) =>
    {
        const outgoing = http.request({
            hostname: '127.0.0.1',
            port,
            path: request.path,
            method: request.method,
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, response =>
        {
            const chunks = []
            response.on('data', chunk => chunks.push(chunk))
            response.on('end', () => resolve({
                status: response.statusCode,
                headers: response.headers,
                body: Buffer.concat(chunks).toString('utf8'),
            }))
        })
        outgoing.on('error', reject)
        outgoing.write(body)
        outgoing.end()
    })
}

/**
 * Runs the callback against a listening server and always closes it afterwards.
 * @param {import('http').Server} server server to listen on an ephemeral port
 * @param {(port: number) => Promise<void>} run work to perform while listening
 * @returns {Promise<void>}
 */
async function with_listening_server(server, run)
{
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    try
    {
        await run(server.address().port)
    }
    finally
    {
        await new Promise(resolve => server.close(resolve))
    }
}

module.exports = { send_request, with_listening_server }
