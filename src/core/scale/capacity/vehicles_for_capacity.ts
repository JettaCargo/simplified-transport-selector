import { le } from '@jetta/number-compare'

/**
 * Ceiling of vehicles needed to cover a required capacity.
 * @param required required capacity
 * @param per_vehicle capacity of one vehicle
 * @returns vehicle count
 */
export function vehicles_for_capacity(required: number, per_vehicle: number): number
{
    if (le(required, 0))
    {
        return 0
    }
    if (le(per_vehicle, 0))
    {
        return Number.POSITIVE_INFINITY
    }
    return Math.ceil(required / per_vehicle)
}
