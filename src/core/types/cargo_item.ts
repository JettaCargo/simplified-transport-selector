/**
 * Item carried by a collect, after schema defaults.
 */
export interface Cargo_Item
{
    id: string
    name: string
    weight: number
    amount: number
    width: number
    length: number
    height: number
    current_rotation: string
    rotations: string[]
    supported_weight: number
    priority: boolean
    type: string
    unlimited: boolean
    volume?: number
}
