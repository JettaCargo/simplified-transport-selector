/**
 * Minimal Manual_Tracer surface used by selection tracing.
 */
export interface Manual_Tracer_Like
{
    start_transaction(context: string, to?: string): string | undefined
    end_transaction_succesfully(tx_id: string | undefined): void
    end_transaction_with_failure(tx_id: string | undefined): void
}

/**
 * Minimal IO_Tracer surface used by HiGHS sub-call tracing.
 */
export interface IO_Tracer_Like
{
    trace(payload: unknown, type: string, context: string): void
}

/**
 * Injectable @jetta/tracer binding for production or tests.
 */
export interface Tracer_Library
{
    Manual_Tracer: new (trace_id: string, base_id?: string) => Manual_Tracer_Like
    IO_Tracer: new (trace_id: string, base_id?: string) => IO_Tracer_Like
    IO_Types: { INPUT: string, OUTPUT: string, EXCEPTION: string }
}

/**
 * Loads the published @jetta/tracer package.
 * @returns tracer library
 */
export function load_tracer_library(): Tracer_Library
{
    return require('@jetta/tracer') as Tracer_Library
}
