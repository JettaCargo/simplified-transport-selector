import { Solve_Timing } from '../../solver/pool/solve_timing'
import { Selection_Path, SELECTION_PATH } from './selection_path'

/**
 * Per-request facts for the outcome log. Holds no payload contents.
 */
export class SelectionMetrics
{
    log_header = ''
    selection_phase = ''
    selection_path: Selection_Path = SELECTION_PATH.INPUT
    solver_status = ''
    assignment_columns = 0
    packing_retries = 0
    queue_wait_milliseconds = 0
    solve_milliseconds = 0

    /**
     * @param request parsed request identity
     * @param request.log_header caller log header
     * @param request.selection_phase selection or reselection
     */
    describe_request(request: { log_header: string, selection_phase: string }): void
    {
        this.log_header = request.log_header
        this.selection_phase = request.selection_phase
    }

    /**
     * @param selection_path branch the request went through
     */
    record_path(selection_path: Selection_Path): void
    {
        this.selection_path = selection_path
    }

    /**
     * @param solve last solver status and model width
     * @param solve.solver_status HiGHS status
     * @param solve.assignment_columns groups times vehicle types
     */
    record_solve(solve: { solver_status: string, assignment_columns: number }): void
    {
        this.solver_status = solve.solver_status
        this.assignment_columns = solve.assignment_columns
    }

    /**
     * @param packing_retries rounds re-solved after first-fit could not pack
     */
    record_packing_retries(packing_retries: number): void
    {
        this.packing_retries = packing_retries
    }

    /**
     * Adds one solver job's timing; packing retries add up across rounds.
     * @param timing queue wait and solve time
     */
    readonly record_timing = (timing: Solve_Timing): void =>
    {
        this.queue_wait_milliseconds += timing.queue_wait_milliseconds
        this.solve_milliseconds += timing.solve_milliseconds
    }
}
