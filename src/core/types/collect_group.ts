import { Cargo_Item } from './cargo_item'

/**
 * One collect, or one unit split out of a collect.
 */
export interface Collect_Group
{
    id: string
    parent_id?: string
    items: Cargo_Item[]
    weight: number
    volume: number
    blacklist: Set<string>
}
