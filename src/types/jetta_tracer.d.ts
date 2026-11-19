declare module '@jetta/tracer'
{
    export class Manual_Tracer
    {
        constructor(trace_id: string, base_id?: string)
        start_transaction(context: string, to?: string): string | undefined
        end_transaction_succesfully(tx_id: string | undefined): void
        end_transaction_with_failure(tx_id: string | undefined): void
    }

    export class IO_Tracer
    {
        constructor(trace_id: string, base_id?: string)
        trace(payload: unknown, type: string, context: string): void
    }

    export const IO_Types: {
        INPUT: string
        OUTPUT: string
        EXCEPTION: string
    }
}
