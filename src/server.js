const http = require('http')
const { select_transports } = require('./select_transports')

const PORT = Number(process.env.PORT || 8085)
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Reads the full request body as text.
 * @param {import('http').IncomingMessage} request request
 * @returns {Promise<string>}
 */
function read_body(request)
{
    return new Promise((resolve, reject) =>
    {
        const chunks = []
        request.on('data', chunk => chunks.push(chunk))
        request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        request.on('error', reject)
    })
}

/**
 * Writes a JSON HTTP response and closes the connection (undici-safe).
 * @param {import('http').ServerResponse} response response
 * @param {number} status status code
 * @param {object|string} body body
 */
function send_json(response, status, body)
{
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(text),
        Connection: 'close',
    })
    response.end(text)
}

/**
 * Handles POST / and POST /transports_selection like the Java selector.
 * @param {import('http').IncomingMessage} request request
 * @param {import('http').ServerResponse} response response
 */
async function handle_transports_selection(request, response)
{
    try
    {
        const raw = await read_body(request)
        const payload = JSON.parse(raw)
        const result = await select_transports(payload)
        send_json(response, 200, result)
    }
    catch (error)
    {
        const message = error && error.message ? error.message : String(error)
        send_json(response, 200, { msg: message, apiError: message })
    }
}

/**
 * @param {import('http').IncomingMessage} request request
 * @param {import('http').ServerResponse} response response
 */
async function route(request, response)
{
    const { method, url } = request
    if (method === 'GET' && (url === '/' || url === '/livez' || url === '/readyz'))
    {
        response.writeHead(200, { 'Content-Type': 'text/plain', Connection: 'close' })
        response.end('MS of Transport Selector JettaCargo ')
        return
    }
    if (method === 'POST' && (url === '/' || url === '/transports_selection'))
    {
        await handle_transports_selection(request, response)
        return
    }
    response.writeHead(404, { Connection: 'close' })
    response.end('not found')
}

const server = http.createServer((request, response) =>
{
    route(request, response).catch(error =>
    {
        const message = error && error.message ? error.message : String(error)
        send_json(response, 500, { msg: message, apiError: message })
    })
})

if (require.main === module)
{
    server.listen(PORT, HOST, () =>
    {
        console.log(`transport-selector-js listening on ${HOST}:${PORT}`)
    })
}

module.exports = { server, route, handle_transports_selection }
