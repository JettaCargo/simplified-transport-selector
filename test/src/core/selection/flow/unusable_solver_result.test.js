const { expect } = require('chai')
const { unusable_solver_result } = require('../../../../../build/core/selection/flow/unusable_solver_result')
const { TRANSPORT_SELECTOR_MESSAGE } = require('../../../../../build/core/messages/catalog/transport_selector_message')

const INCUMBENT_COLUMNS = { n_truck: { Primal: 1 }, x_a_truck: { Primal: 1 } }

describe('unusable_solver_result', function ()
{
    it('accepts a proven optimum', function ()
    {
        expect(unusable_solver_result({ Status: 'Optimal', ObjectiveValue: 3, Columns: INCUMBENT_COLUMNS })).to.equal(undefined)
    })

    it('accepts the incumbent of a time-limited solve', function ()
    {
        expect(unusable_solver_result({ Status: 'Time limit reached', ObjectiveValue: 3, Columns: INCUMBENT_COLUMNS })).to.equal(undefined)
    })

    it('reports the time-limit key when the time-limited solve has no incumbent', function ()
    {
        const without_objective = { Status: 'Time limit reached', ObjectiveValue: Infinity, Columns: INCUMBENT_COLUMNS }
        const without_columns = { Status: 'Time limit reached', ObjectiveValue: 3, Columns: {} }
        for (const result of [without_objective, without_columns])
            expect(unusable_solver_result(result).messages.errors).to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.SOLVER_TIME_LIMIT]])
    })

    it('reports the solver-status key with the status for anything else, including OptimalInfeas', function ()
    {
        for (const status of ['OptimalInfeas', 'Infeasible', 'Unbounded', 'Iteration limit reached'])
            expect(unusable_solver_result({ Status: status, ObjectiveValue: 3, Columns: INCUMBENT_COLUMNS }).messages.errors)
                .to.deep.equal([[TRANSPORT_SELECTOR_MESSAGE.SOLVER_STATUS, status]])
    })
})
