/**
 * Detects selection vs reselection from the gateway log header.
 * @param log_header log header
 * @returns selection phase
 */
export function detect_selection_phase(log_header: string | undefined): 'selection' | 'reselection'
{
    return String(log_header || '').includes('-reselection-') ? 'reselection' : 'selection'
}
