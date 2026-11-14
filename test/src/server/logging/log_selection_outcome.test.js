const { expect } = require('chai')
const { log_selection_outcome } = require('../../../../build/server/logging/log_selection_outcome')
const { use_selection_outcome_logger } = require('../../../../build/server/logging/selection_outcome_logger')
const { SelectionMetrics } = require('../../../../build/core/selection/metrics/Selection_Metrics')
const { SELECTION_PATH } = require('../../../../build/core/selection/metrics/selection_path')
const { error_response } = require('../../../../build/core/messages/envelope/error_response')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../build/core/messages/catalog/transport_selector_message')
const { SolverWorkerCrashException } = require('../../../../build/core/solver/pool/errors/Solver_Worker_Crash_Exception')
const { capturing_logger } = require('../../../helpers/capturing_logger')

/**
 * @returns {SelectionMetrics} metrics of a solved request
 */
function solved_metrics()
{
    const metrics = new SelectionMetrics()
    metrics.describe_request({ log_header: 'cargo-1-selection-0', selection_phase: 'selection' })
    metrics.selection_path = SELECTION_PATH.SOLVER
    metrics.record_timing({ queue_wait_milliseconds: 3, solve_milliseconds: 40 })
    metrics.record_solve({ solver_status: 'Optimal', assignment_columns: 12 })
    return metrics
}

describe('log_selection_outcome', function ()
{
    let logger

    beforeEach(function ()
    {
        logger = capturing_logger()
        use_selection_outcome_logger(logger)
    })

    it('writes one structured line with request identity, timings, solver facts, and outcome key', function ()
    {
        log_selection_outcome(solved_metrics(), { body: { vehicles_array: [] }, started_at: Date.now() })
        expect(logger.lines).to.have.length(1)
        const entry = JSON.parse(logger.lines[0].text)
        expect(entry).to.include({
            log_header: 'cargo-1-selection-0',
            selection_phase: 'selection',
            selection_path: SELECTION_PATH.SOLVER,
            outcome_key: 'success',
            queue_wait_milliseconds: 3,
            solve_milliseconds: 40,
            solver_status: 'Optimal',
            assignment_columns: 12,
            packing_retries: 0,
        })
        expect(entry.total_milliseconds).to.be.a('number')
    })

    it('uses the first catalog key of an error envelope as the outcome key', function ()
    {
        const body = error_response(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED)
        log_selection_outcome(solved_metrics(), { body, started_at: Date.now() })
        expect(JSON.parse(logger.lines[0].text).outcome_key).to.equal(TRANSPORT_SELECTOR_MESSAGE.PACKING_FAILED)
    })

    it('logs the raw cause and stack of an internal error on a separate error line', function ()
    {
        const error = new Error('cannot read properties of undefined')
        const body = error_response(TRANSPORT_SELECTOR_MESSAGE.INTERNAL_ERROR)
        log_selection_outcome(solved_metrics(), { body, error, started_at: Date.now() })
        const failure = logger.lines.find(line => line.level === 'error')
        expect(failure.text).to.include('cannot read properties of undefined')
        expect(failure.text).to.include('log_selection_outcome.test.js')
    })

    it('logs the crash detail of a solver worker crash', function ()
    {
        const error = new SolverWorkerCrashException('worker exited with code 134')
        const body = error_response(TRANSPORT_SELECTOR_MESSAGE.SOLVER_WORKER_CRASH)
        log_selection_outcome(solved_metrics(), { body, error, started_at: Date.now() })
        expect(logger.lines.find(line => line.level === 'error').text).to.include('worker exited with code 134')
    })

    it('does not log a failure line for a catalog validation error', function ()
    {
        const body = error_response(TRANSPORT_SELECTOR_MESSAGE.INVALID_FIELD, ['weight'])
        log_selection_outcome(new SelectionMetrics(), { body, error: new Error('ignored'), started_at: Date.now() })
        expect(logger.lines.map(line => line.level)).to.deep.equal(['log'])
    })
})
