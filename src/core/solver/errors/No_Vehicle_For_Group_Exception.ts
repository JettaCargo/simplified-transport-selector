import { Message_Tuple } from '../../messages/envelope/message_tuple'
import { TRANSPORT_SELECTOR_MESSAGE } from '../../messages/catalog/transport_selector_message'

/**
 * A group has no feasible vehicle type while the model is built.
 */
export class NoVehicleForGroupException extends Error
{
    readonly group_id: string
    readonly message_entry: Message_Tuple

    /**
     * @param group_id group that no vehicle can take
     */
    constructor(group_id: string)
    {
        super(TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP)
        this.name = 'NoVehicleForGroupException'
        this.group_id = group_id
        this.message_entry = [TRANSPORT_SELECTOR_MESSAGE.NO_VEHICLE_FOR_GROUP, group_id]
    }
}
