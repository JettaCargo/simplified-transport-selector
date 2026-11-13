import { parse_payload } from './parse_payload'
import { positive_amount } from './positive_amount'
import { unique_vehicles } from './unique_vehicles'
import { Validated_Input } from './validated_input'

/**
 * Validates a transport-selection payload and applies the Java read defaults.
 * @param payload raw request body
 * @returns payload with defaults, unique vehicles, and positive-amount items
 */
export function validate_selector_input(payload: unknown): Validated_Input
{
    const parsed = parse_payload(payload)
    return {
        ...parsed,
        vehicles: unique_vehicles(parsed.vehicles),
        collects: parsed.collects.map(collect => ({
            ...collect,
            items: positive_amount(collect.items),
        })),
        accessories: positive_amount(parsed.accessories),
    }
}
