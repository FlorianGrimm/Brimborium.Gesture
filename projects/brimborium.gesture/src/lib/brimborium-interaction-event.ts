import { type BrimboriumInteractionTypeName } from "./brimborium-gesture-consts";
import { type BrimboriumGestureEvent } from "./brimborium-gesture-event";
import { type BrimboriumGestureNodeRef } from "./brimborium-gesture-node-ref";

export class BrimboriumInteractionEvent {
    constructor(
        public eventType:BrimboriumInteractionTypeName,
        public gestureEvent:BrimboriumGestureEvent,
        public nodeRef: BrimboriumGestureNodeRef | undefined,
    ) {
    }
}
