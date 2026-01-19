import { ItemBrimboriumGestureInteractionOutcome } from "./brimborium-gesture-consts";

import { BrimboriumLocalQueue, ProcessItemFn } from 'Brimborium.Data';

export class BrimboriumGestureInteractionOutcome extends BrimboriumLocalQueue<ItemBrimboriumGestureInteractionOutcome> {
    constructor(
        process: ProcessItemFn<ItemBrimboriumGestureInteractionOutcome>
    ) {
        super(process, isUnique);
    }
}
function isUnique(
    value: ItemBrimboriumGestureInteractionOutcome,
    that: BrimboriumGestureInteractionOutcome
) {
    if (that.list != null) {
        if ("interactionEvent" === value.type) {
            for (const outcome of that.list) {
                if ("interactionEvent" === outcome.type) {
                    if (value.interactionEvent.eventType === outcome.interactionEvent.eventType) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
