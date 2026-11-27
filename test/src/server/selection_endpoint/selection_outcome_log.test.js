const { expect } = require('chai')
const { server } = require('../../../../build/server/http/server')
const { use_selection_outcome_logger } = require('../../../../build/server/logging/selection_outcome_logger')
const { close_shared_solver_pool } = require('../../../../build/core/solver/pool/shared_solver_pool')
const { SELECTION_PATH } = require('../../../../build/core/selection/metrics/selection_path')
const { send_request, with_listening_server } = require('../../../helpers/http_client')
const { capturing_logger } = require('../../../helpers/capturing_logger')
const SELECTION_PAYLOAD = require('../../../data/src/server/selection_endpoint/gateway/selection_payload.json')

describe('selection outcome log integration', function ()
{
    this.timeout(30000)

    after(async function ()
    {
        await close_shared_solver_pool()
    })

    it('logs one line per request with solver facts and no payload contents', async function ()
    {
        const logger = capturing_logger()
        use_selection_outcome_logger(logger)
        await with_listening_server(server, async port =>
        {
            await send_request(port, { method: 'POST', path: '/transports_selection', body: JSON.stringify(SELECTION_PAYLOAD) })
        })
        expect(logger.lines).to.have.length(1)
        const entry = JSON.parse(logger.lines[0].text)
        expect(entry).to.include({ log_header: SELECTION_PAYLOAD.log_header, selection_path: SELECTION_PATH.SOLVER, outcome_key: 'success' })
        expect(entry.solver_status).to.equal('Optimal')
        expect(entry.assignment_columns).to.be.greaterThan(0)
        expect(entry.solve_milliseconds).to.be.greaterThan(0)
        expect(Object.keys(entry)).to.have.members([
            'event', 'log_header', 'selection_phase', 'selection_path', 'solver_status', 'assignment_columns',
            'packing_retries', 'queue_wait_milliseconds', 'solve_milliseconds', 'outcome_key', 'total_milliseconds',
        ])
    })

    it('logs the catalog key when the body is not JSON', async function ()
    {
        const logger = capturing_logger()
        use_selection_outcome_logger(logger)
        await with_listening_server(server, async port =>
        {
            await send_request(port, { method: 'POST', path: '/transports_selection', body: '{not json' })
        })
        expect(JSON.parse(logger.lines[0].text).outcome_key).to.equal('transport_selector.104005')
    })
})
