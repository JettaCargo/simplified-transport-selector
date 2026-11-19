const { parse_request } = require('./parse_request')
const { groups_without_vehicle } = require('./fit')
const { expand_divisible_groups } = require('./expand_divisible_groups')
const { items_dont_fit_response } = require('./errors')
const { build_aggregated_model } = require('./solver/build_aggregated_model')
const { solve_lp } = require('./solver/highs_client')
const { read_solution } = require('./solver/read_solution')
const { build_chosen_fleet } = require('./build_chosen_fleet')
const { format_response } = require('./format_response')
const { resolve_trace_id } = require('./trace/resolve_trace_id')
const with_manual_transaction = require('./trace/with_manual_transaction')
const trace_highs_solve = require('./trace/trace_highs_solve')

/**
 * Selects transports with a type-level MILP plus bin packing.
 * @param {object} payload Java selector request body
 * @returns {Promise<object>} vehicles_array response or error payload
 */
async function select_transports(payload)
{
    const trace_id = resolve_trace_id(payload)
    if (!trace_id)
        return run_selection(payload, null)

    const base_id = payload.log_header || undefined
    return with_manual_transaction({
        trace_id,
        base_id,
        context: 'transport-selection',
        to: 'simplified-transport-selector',
        async_fn: () => run_selection(payload, { trace_id, base_id }),
    })
}

/**
 * Runs the selection pipeline, optionally with nested Manual_Tracer spans.
 * @param {object} payload raw request body
 * @param {{trace_id: string, base_id: string|undefined}|null} tracing tracing ids or null
 * @returns {Promise<object>}
 */
async function run_selection(payload, tracing)
{
    const request = parse_request(payload)
    request.groups = expand_divisible_groups(request.groups, request.vehicles, request.gaps)
    const impossible = groups_without_vehicle(request.groups, request.vehicles, request.gaps)
    if (impossible.length > 0)
        return items_dont_fit_response(impossible.map(group => group.parent_id || group.id).join(','))

    const model = await build_model(request, tracing)
    if (model.error_response)
        return model.error_response

    const result = await solve_model(model.lp, tracing)
    if (result.Status !== 'Optimal' && result.Status !== 'OptimalInfeas')
        return items_dont_fit_response(`solver_status=${result.Status}`)

    const solution = read_solution(result, request.groups, request.vehicles)
    const chosen = await pack_fleet(request, solution, tracing)
    if (!chosen)
        return items_dont_fit_response('packing_failed')
    return format_response(chosen)
}

/**
 * @param {object} request parsed request
 * @param {{trace_id: string, base_id: string|undefined}|null} tracing tracing ids
 * @returns {Promise<{lp?: string, error_response?: object}>}
 */
async function build_model(request, tracing)
{
    const run = () =>
    {
        try
        {
            return { lp: build_aggregated_model(request).lp }
        }
        catch (error)
        {
            return { error_response: items_dont_fit_response(error.message) }
        }
    }
    if (!tracing)
        return run()
    return with_manual_transaction({
        trace_id: tracing.trace_id,
        base_id: tracing.base_id,
        context: 'build-aggregated-model',
        async_fn: async () => run(),
    })
}

/**
 * @param {string} model_text LP text
 * @param {{trace_id: string, base_id: string|undefined}|null} tracing tracing ids
 * @returns {Promise<object>}
 */
async function solve_model(model_text, tracing)
{
    if (!tracing)
        return solve_lp(model_text)
    return trace_highs_solve({
        trace_id: tracing.trace_id,
        base_id: tracing.base_id,
        model_text,
    })
}

/**
 * @param {object} request parsed request
 * @param {{counts: Map, assignment: Map}} solution solver output
 * @param {{trace_id: string, base_id: string|undefined}|null} tracing tracing ids
 * @returns {Promise<object[]|null>}
 */
async function pack_fleet(request, solution, tracing)
{
    if (!tracing)
        return build_chosen_fleet(request, solution)
    return with_manual_transaction({
        trace_id: tracing.trace_id,
        base_id: tracing.base_id,
        context: 'pack-fleet',
        async_fn: async () => build_chosen_fleet(request, solution),
    })
}

module.exports = { select_transports }
