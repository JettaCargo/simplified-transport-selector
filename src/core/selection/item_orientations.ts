import { ROTATION } from '../input/selector_input_vocabulary'
import { Cargo_Item } from '../types/cargo_item'

/**
 * Builds dimension orientations from declared rotations.
 * @param item item
 * @returns length, width, height triples
 */
export function item_orientations(item: Cargo_Item): number[][]
{
    const length = item.length || 0
    const width = item.width || 0
    const height = item.height || 0
    const rotations = item.rotations || [ROTATION.POS1]
    const orientations = [[length, width, height]]
    if (rotations.includes(ROTATION.POS4))
    {
        orientations.push([width, length, height])
    }
    return orientations
}
