import { Error_Envelope } from '../../messages/envelope/error_envelope'
import { Packing_Cut } from '../../solver/constraints/packing_cut'
import { Selector_Success } from '../response/format_response'
import { Selection_Options } from './selection_options'

/**
 * Inputs of one solve round.
 */
export interface Solve_Round_Input extends Selection_Options
{
    packing_cuts: Packing_Cut[]
    time_limit_seconds: number
}

/**
 * Final response of the round, or the assignment the next round must forbid.
 */
export type Solve_Round_Outcome = { response: Selector_Success | Error_Envelope } | { packing_cut: Packing_Cut }
