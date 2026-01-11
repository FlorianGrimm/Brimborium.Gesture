import type { BrimboriumGesture } from "./brimborium-gesture";
import { BrimboriumGestureHandle } from "./brimborium-gesture-handle";

export class BrimboriumGestureNodeRef {
    gesture: BrimboriumGesture | undefined;
    gestureHandle: BrimboriumGestureHandle | undefined;
    constructor() { }

    setGesture(value: BrimboriumGesture) {
        this.gesture = value;
    }
    setGestureHandle(value: BrimboriumGestureHandle) {
        this.gestureHandle = value;
    }

    isEventTarget() {
        // this is the gestureHandle
        if (this.gestureHandle != null) { return true; }

        // this is the gesture with no gestureHandle
        if (this.gesture != null) {
            if (this.gestureHandle == null) { return true; }
        }

        return false;
    }

}
