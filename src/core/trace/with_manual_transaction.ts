import { load_tracer_library, Tracer_Library } from './tracer_library'

/**
 * Options for a Manual_Tracer start/end pair.
 */
export interface Manual_Transaction_Options<T>
{
    trace_id: string
    context: string
    async_fn: () => Promise<T>
    to?: string
    base_id?: string
    tracer_library?: Tracer_Library
}

/**
 * Runs an async function inside a Manual_Tracer start/end pair.
 * @param options transaction options
 * @returns result of async_fn
 */
export async function with_manual_transaction<T>(options: Manual_Transaction_Options<T>): Promise<T>
{
    const library = options.tracer_library || load_tracer_library()
    const tracer = new library.Manual_Tracer(options.trace_id, options.base_id)
    const tx_id = tracer.start_transaction(options.context, options.to)
    try
    {
        const result = await options.async_fn()
        tracer.end_transaction_succesfully(tx_id)
        return result
    }
    catch (error)
    {
        tracer.end_transaction_with_failure(tx_id)
        throw error
    }
}
