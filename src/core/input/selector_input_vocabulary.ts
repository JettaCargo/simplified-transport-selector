/**
 * Fixed vocabularies read by the Java transport selector.
 */
export const TRANSPORT_CHOICE_CRITERIA = Object.freeze({
    VOLUME: 'VOLUME',
    WEIGHT: 'WEIGHT',
    AMOUNT: 'AMOUNT',
    COST: 'COST',
    DISABLED: 'DISABLED',
})

export const ROTATION = Object.freeze({
    POS1: 'POS1',
    POS2: 'POS2',
    POS3: 'POS3',
    POS4: 'POS4',
    POS5: 'POS5',
    POS6: 'POS6',
})

export const TRANSPORT_MEASURE = Object.freeze({
    HEIGHT: 'HEIGHT',
    LENGTH: 'LENGTH',
    WIDTH: 'WIDTH',
    WEIGHT: 'WEIGHT',
    SUPPORTED_WEIGHT: 'SUPPORTED_WEIGHT',
})

export const TRANSPORT_CHOICE_CRITERIA_VALUES = Object.freeze(
    Object.values(TRANSPORT_CHOICE_CRITERIA),
) as readonly [string, ...string[]]

export const ROTATION_VALUES = Object.freeze(Object.values(ROTATION)) as readonly [string, ...string[]]

export const TRANSPORT_MEASURE_VALUES = Object.freeze(
    Object.values(TRANSPORT_MEASURE),
) as readonly [string, ...string[]]
