import { gt } from '@jetta/number-compare'
import { supported_weight_with_gap } from '../../scale/capacity/supported_weight_with_gap'
import { volume_with_gap } from '../../scale/capacity/volume_with_gap'
import { Capacity_Gaps } from '../../scale/capacity/capacity_gaps'
import { Parsed_Vehicle } from '../../input/vehicle/parsed_vehicle'
import { Selector_Config } from '../../input/request/selector_config'

interface Floor_Row
{
    count_keys: string[]
    name: string
    amount: number
    coefficient: (vehicle: Parsed_Vehicle) => number
}

/**
 * Adds global minimum volume and weight capacity rows.
 * @param constraints constraint list
 * @param vehicles vehicles
 * @param required gaps, config, and count variable names
 */
export function add_minimum_required(
    constraints: string[],
    vehicles: Parsed_Vehicle[],
    required: { gaps: Capacity_Gaps, config: Selector_Config, count_keys: string[] },
): void
{
    push_floor(constraints, vehicles, volume_floor(required))
    push_floor(constraints, vehicles, weight_floor(required))
}

/**
 * @param required request floors
 * @returns volume floor
 */
function volume_floor(required: { gaps: Capacity_Gaps, config: Selector_Config, count_keys: string[] }): Floor_Row
{
    return {
        count_keys: required.count_keys,
        name: 'min_vol',
        amount: Number(required.config.minimum_required_volume || 0),
        coefficient: vehicle => volume_with_gap(vehicle, required.gaps.volume),
    }
}

/**
 * @param required request floors
 * @returns weight floor
 */
function weight_floor(required: { gaps: Capacity_Gaps, config: Selector_Config, count_keys: string[] }): Floor_Row
{
    return {
        count_keys: required.count_keys,
        name: 'min_weight',
        amount: Number(required.config.minimum_required_supported_weight || 0),
        coefficient: vehicle => supported_weight_with_gap(vehicle, required.gaps.weight),
    }
}

/**
 * @param constraints constraint list
 * @param vehicles vehicles
 * @param floor named floor and its coefficient
 */
function push_floor(constraints: string[], vehicles: Parsed_Vehicle[], floor: Floor_Row): void
{
    if (!gt(floor.amount, 0))
    {
        return
    }
    constraints.push(minimum_row(floor.name, vehicles, {
        count_keys: floor.count_keys,
        coefficient: floor.coefficient,
        required: floor.amount,
    }))
}

/**
 * @param name row name
 * @param vehicles vehicles
 * @param row count variables, coefficient, and required total
 * @returns LP row
 */
function minimum_row(
    name: string,
    vehicles: Parsed_Vehicle[],
    row: { count_keys: string[], coefficient: (vehicle: Parsed_Vehicle) => number, required: number },
): string
{
    const terms = vehicles.map((vehicle, index) => `${row.coefficient(vehicle)} ${row.count_keys[index]}`)
    return `${name}: ${terms.join(' + ')} >= ${row.required}`
}
