import { Tracer_Library } from '../../trace/tracer_library'
import { SelectionMetrics } from '../metrics/Selection_Metrics'

/**
 * Per-request selection options.
 */
export interface Selection_Options
{
    signal?: AbortSignal
    metrics?: SelectionMetrics
    tracer_library?: Tracer_Library
}
