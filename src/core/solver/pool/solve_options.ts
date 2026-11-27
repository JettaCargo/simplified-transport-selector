import { Solve_Timing } from './solve_timing'

/**
 * Per-call solve options.
 */
export interface Solve_Options
{
    signal?: AbortSignal
    time_limit_seconds?: number
    on_timing?: (timing: Solve_Timing) => void
}
