import { Highs_Result } from '../solver/highs/highs_result'
import { Solve_Options } from '../solver/pool/solve_options'
import { solve_lp } from '../solver/highs/solve_lp'
import { IO_Tracer_Like, load_tracer_library, Manual_Tracer_Like, Tracer_Library } from './tracer_library'
import { summarize_highs_result } from './summarize_highs_result'

const HIGHS_CONTEXT = 'highs-solve'

/**
 * Options for a traced HiGHS solve.
 */
export interface Trace_Highs_Solve_Options extends Solve_Options
{
    trace_id: string
    model_text: string
    base_id?: string
    tracer_library?: Tracer_Library
}

/**
 * Active tracers for one HiGHS call.
 */
interface Highs_Trace_Session
{
    library: Tracer_Library
    io_tracer: IO_Tracer_Like
    tracer: Manual_Tracer_Like
    tx_id: string | undefined
}

/**
 * Solves an LP with Manual_Tracer + IO_Tracer around the HiGHS sub-call.
 * @param options solve and tracing options
 * @returns HiGHS result
 */
export async function trace_highs_solve(options: Trace_Highs_Solve_Options): Promise<Highs_Result>
{
    const session = open_highs_trace_session(options)
    try
    {
        return await finish_highs_trace(options, session)
    }
    catch (error)
    {
        fail_highs_trace(session, error)
        throw error
    }
}

/**
 * @param options solve options
 * @returns open tracer session after INPUT + start
 */
function open_highs_trace_session(options: Trace_Highs_Solve_Options): Highs_Trace_Session
{
    const library = options.tracer_library || load_tracer_library()
    const io_tracer = new library.IO_Tracer(options.trace_id, options.base_id)
    const tracer = new library.Manual_Tracer(options.trace_id, options.base_id)
    io_tracer.trace(options.model_text, library.IO_Types.INPUT, HIGHS_CONTEXT)
    return {
        library,
        io_tracer,
        tracer,
        tx_id: tracer.start_transaction(HIGHS_CONTEXT, 'highs'),
    }
}

/**
 * @param options solve options
 * @param session open tracers
 * @returns HiGHS result
 */
async function finish_highs_trace(
    options: Trace_Highs_Solve_Options,
    session: Highs_Trace_Session,
): Promise<Highs_Result>
{
    const result = await solve_lp(options.model_text, options)
    session.io_tracer.trace(
        summarize_highs_result(result),
        session.library.IO_Types.OUTPUT,
        HIGHS_CONTEXT)
    session.tracer.end_transaction_succesfully(session.tx_id)
    return result
}

/**
 * @param session open tracers
 * @param error thrown error
 */
function fail_highs_trace(session: Highs_Trace_Session, error: unknown): void
{
    const message = error instanceof Error ? error.message : String(error)
    session.io_tracer.trace({ message }, session.library.IO_Types.EXCEPTION, HIGHS_CONTEXT)
    session.tracer.end_transaction_with_failure(session.tx_id)
}
