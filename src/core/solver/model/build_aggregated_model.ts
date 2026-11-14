import { Selector_Request } from '../../input/request/selector_request'
import { add_capacity_rows } from '../constraints/add_capacity_rows'
import { add_feedback_cuts } from '../constraints/add_feedback_cuts'
import { add_group_assignment } from '../constraints/add_group_assignment'
import { add_minimum_required } from '../constraints/add_minimum_required'
import { add_packing_cuts } from '../constraints/add_packing_cuts'
import { Packing_Cut } from '../constraints/packing_cut'
import { add_vehicle_counts } from '../constraints/add_vehicle_counts'
import { Aggregated_Model } from './aggregated_model'
import { Model_Context } from './model_context'
import { rank_vehicle_costs } from '../objective/rank_vehicle_costs'
import { render_lp } from './render_lp'

/**
 * Builds a type-level MILP in LP format.
 * @param request parsed request
 * @param packing_cuts unpackable assignments to forbid
 * @returns LP model
 */
export function build_aggregated_model(request: Selector_Request, packing_cuts: Packing_Cut[] = []): Aggregated_Model
{
    const context = empty_context(request)
    const ranked_cost = rank_vehicle_costs(request.vehicles)
    add_vehicle_counts(context, request, ranked_cost)
    for (const group of request.groups)
    {
        add_group_assignment(group, context, request.gaps)
    }
    for (const vehicle of request.vehicles)
    {
        add_capacity_rows(vehicle, request.groups, { gaps: request.gaps, constraints: context.constraints })
    }
    add_minimum_required(context.constraints, request.vehicles, {
        gaps: request.gaps,
        config: request.config,
        count_keys: context.count_keys,
    })
    add_feedback_cuts(context.constraints, request)
    add_packing_cuts(context.constraints, packing_cuts)
    return { ...context, lp: render_lp(context) }
}

/**
 * @param request request
 * @returns empty model pieces
 */
function empty_context(request: Selector_Request): Model_Context
{
    return {
        groups: request.groups,
        vehicles: request.vehicles,
        assignment_keys: [],
        count_keys: [],
        objective: [],
        constraints: [],
        binaries: [],
        generals: [],
        bounds: [],
    }
}
