const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const http = require('http')
const { select_transports } = require('../../../../build/index')
const { server } = require('../../../../build/server/server')

const SELECTION_PAYLOAD = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../data/gateway/selection_payload.json'), 'utf8'),
)

/**
 * Mirrors Selection_Strategy.get_transport_reference + get_waypoint_references checks.
 * @param {object} input selector input
 * @param {object} output selector output
 */
function assert_gateway_can_consume(input, output)
{
    expect(output.apiError, JSON.stringify(output)).to.equal(undefined)
    expect(output.vehicles_array).to.be.an('array').that.is.not.empty
    const vehicle_ids = new Set(input.vehicles.map(vehicle => vehicle.id))
    const collect_ids = new Set(input.collects.map(collect => collect.id))
    for (const entry of output.vehicles_array)
    {
        expect(vehicle_ids.has(entry.vehicle.id)).to.equal(true)
        expect(entry.collects).to.be.an('array')
        for (const collect of entry.collects)
            expect(collect_ids.has(collect.id)).to.equal(true)
    }
}

/**
 * @param {number} port port
 * @param {object} payload body
 * @returns {Promise<object>}
 */
function post_transports_selection(port, payload)
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
            const chunks = []
            response.on('data', chunk => chunks.push(chunk))
            response.on('end', () =>
            {
                resolve({
                    status: response.statusCode,
                    body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
                    connection: response.headers.connection,
                })
            })
        })
        request.on('error', reject)
        request.write(body)
        request.end()
    })
}

describe('Gateway selection and reselection contract', function ()
{
    it('selection response is consumable by the gateway (ids round-trip)', async function ()
    {
        const output = await select_transports(SELECTION_PAYLOAD)
        assert_gateway_can_consume(SELECTION_PAYLOAD, output)
    })

    it('reselection with raised floors returns a larger fleet and valid ids', async function ()
    {
        const first = await select_transports(SELECTION_PAYLOAD)
        assert_gateway_can_consume(SELECTION_PAYLOAD, first)

        const reselection = structuredClone(SELECTION_PAYLOAD)
        reselection.log_header = '6af30051&1/encoded_wp_metalsa_a-reselection-1'
        reselection.config.minimum_required_supported_weight = 64000
        reselection.config.minimum_required_volume = 180

        const second = await select_transports(reselection)
        assert_gateway_can_consume(reselection, second)
        expect(second.vehicles_array.length).to.be.above(first.vehicles_array.length)
    })

    it('POST /transports_selection serves the gateway path and closes the connection', async function ()
    {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
        const { port } = server.address()
        try
        {
            const { status, body, connection } = await post_transports_selection(port, SELECTION_PAYLOAD)
            expect(status).to.equal(200)
            expect(connection).to.equal('close')
            assert_gateway_can_consume(SELECTION_PAYLOAD, body)
        }
        finally
        {
            await new Promise(resolve => server.close(resolve))
        }
    })

    it('impossible payload returns apiError the gateway throws on', async function ()
    {
        const impossible = structuredClone(SELECTION_PAYLOAD)
        impossible.vehicles = impossible.vehicles.map(vehicle => ({
            ...vehicle,
            supported_weight: 1,
            containers: vehicle.containers.map(container => ({
                ...container,
                supported_weight: 1,
                length: 0.1,
                width: 0.1,
                height: 0.1,
            })),
        }))
        const output = await select_transports(impossible)
        expect(output.apiError).to.be.a('string').that.is.not.empty
        expect(output.msg).to.equal(output.apiError)
        expect(output.vehicles_array).to.equal(undefined)
    })
})
