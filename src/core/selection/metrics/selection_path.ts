/**
 * Which branch of the selection a request went through.
 * `input` means it stopped before reaching a selection branch.
 */
export const SELECTION_PATH = Object.freeze({
    INPUT: 'input',
    SINGLE_LIMITED: 'single_limited',
    SOLVER: 'solver',
} as const)

export type Selection_Path = typeof SELECTION_PATH[keyof typeof SELECTION_PATH]
