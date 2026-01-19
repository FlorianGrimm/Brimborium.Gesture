import { ItemBrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-consts";
import { BrimboriumLocalQueue, ProcessItemFn } from 'Brimborium.Data';

export class BrimboriumGestureRecognitionOutcome extends BrimboriumLocalQueue<ItemBrimboriumGestureRecognitionOutcome> {
    constructor(
        process: ProcessItemFn<ItemBrimboriumGestureRecognitionOutcome>
    ) {
        super(process, isUnique);
    }
}
function isUnique(
    value: ItemBrimboriumGestureRecognitionOutcome,
    that: BrimboriumGestureRecognitionOutcome
) {
    if (that.list != null) {
        if ("gestureEvent" === value.type) {
            for (const outcome of that.list) {
                if ("gestureEvent" === outcome.type) {
                    if (value.gestureEvent.eventType === outcome.gestureEvent.eventType) {
                        return false;
                    }
                }
            }
        } else {
            // OK
        }
    }
    return true;
}
