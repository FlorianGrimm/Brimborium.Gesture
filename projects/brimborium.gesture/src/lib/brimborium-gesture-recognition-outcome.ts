import { ItemBrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-consts";

export class BrimboriumGestureRecognitionOutcome {
    constructor() {
    }

    public listOutcome: ItemBrimboriumGestureRecognitionOutcome[] | undefined = undefined;

    /**
     * add the value if it is unique
     * @param value the value to add
     * @returns true if added
     */
    addOutcome(value: ItemBrimboriumGestureRecognitionOutcome): boolean {
        if (this.listOutcome != null) {
            if ("gestureEvent" === value.type) {
                for (const outcome of this.listOutcome) {
                    if ("gestureEvent" === outcome.type) {
                        if (value.gestureEvent.eventType === outcome.gestureEvent.eventType) {
                            return false;
                        }
                    }
                }
            }
        }
        (this.listOutcome ?? []).push(value);
        return true;
    }
}
