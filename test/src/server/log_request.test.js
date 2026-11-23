const { expect } = require('chai')
const http = require('http')
const { server } = require('../../../src/server')

/**
 * Posts a JSON body to the selector.
 * @param {number} port listening port
 * @param {object} payload request body
 * @returns {Promise<number>} status code
 */
function post_json(port, payload)
{
    return new Promise((resolve, reject) =>
    {
        const body = JSON.stringify(payload)
        const request = http.request({
            hostname: '127.0.0.1',
            port,
            path: '/transports_selection',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        }, response =>
        {
            response.resume()
            response.on('end', () => resolve(response.statusCode))
        })
        request.on('error', reject)
        request.write(body)
        request.end()
    })
}

describe('transport selection request log', () =>
{
    it('logs trace_id and log_header when a selection request arrives', async () =>
    {
        const lines = []
        const original_log = console.log
        console.log = line => lines.push(line)
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
        const { port } = server.address()
        try
        {
            const status = await post_json(port, {
                trace_id: '6b0431d2&1795437011023',
                log_header: '6b0431d2&1795437011023/waypoint-selection-0',
                collects: [],
                vehicles: [],
            })
            expect(status).to.equal(200)
            const request_line = lines.find(line => line.includes('Transport Selection Request'))
            expect(request_line).to.include('6b0431d2&1795437011023')
            expect(request_line).to.include('6b0431d2&1795437011023/waypoint-selection-0')
            expect(request_line).to.include('"collect_count":0')
            expect(request_line).to.include('"vehicle_count":0')
        }
        finally
        {
            console.log = original_log
            if (server.listening)
                await new Promise(resolve => server.close(resolve))
        }
    })
})
