import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { Point2D } from "./point2d";
import type { BrimboriumGestureTypeName, BrimboriumInteractionTypeName, IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";
import type { BrimboriumGestureManager } from "./brimborium-gesture-manager";

import { BrimboriumInteractionEvent } from "./brimborium-interaction-event";

type BrimboriumGestureInteractionPrimaryClickState
    = 'Start'
    | 'Dragging'
    | 'End'
    ;

export class BrimboriumGestureInteractionPrimaryClick extends BrimboriumGestureInteraction<BrimboriumGestureInteractionPrimaryClickState> {
    constructor(
        public manager: BrimboriumGestureManager
    ) {
        super("PrimaryClick", "Start")
    }

    override getListSupportedInteractionName(): readonly BrimboriumInteractionTypeName[] {
        return ['PrimaryClick', 'PrimaryDoubleClick', 'PrimaryLongClick'] as const;
    }

    override getListNeededGesture(interactionName: BrimboriumInteractionTypeName): readonly BrimboriumGestureTypeName[] {
        return ['PrimaryClick', 'PrimaryLongClick'] as const;
    }

    override processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean {
        console.log("BrimboriumGestureInteractionPrimaryClick", gestureEvent.eventType)
        const isEnabledPrimaryClick = gestureEvent.getInteractionEnabled()?.has('PrimaryClick');
        const isEnabledPrimaryDoubleClick = gestureEvent.getInteractionEnabled()?.has('PrimaryDoubleClick');
        const isEnabledPrimaryLongClick = gestureEvent.getInteractionEnabled()?.has('PrimaryLongClick');
        if ("PrimaryClick" === gestureEvent.eventType) {
            if (isEnabledPrimaryDoubleClick) {
                const last = this.interactionEventChain.getLast();
                if ((last != null) && ("PrimaryClick" === last.eventType)) {
                    const diffTimeStamp = gestureEvent.timeStamp - last.gestureEvent.timeStamp;
                    console.log("diffTimeStamp",diffTimeStamp);
                    if (diffTimeStamp < this.manager.options.longClickThreshold) {
                        const interactionEvent = new BrimboriumInteractionEvent(
                            "PrimaryDoubleClick",
                            gestureEvent,
                            gestureEvent.nodeRef
                        );
                        this.interactionOutcome?.add({ "type": "interactionEvent", interactionEvent: interactionEvent });
                        console.log("PrimaryDoubleClick");
                        return true;
                    }
                }
            }
            this.interactionEventChain.clear();
            if (isEnabledPrimaryClick) {
                const interactionEvent = new BrimboriumInteractionEvent(
                    "PrimaryClick",
                    gestureEvent,
                    gestureEvent.nodeRef
                );
                this.interactionOutcome?.add({ "type": "interactionEvent", interactionEvent: interactionEvent });
                console.log("PrimaryClick");
                this.interactionEventChain.add(interactionEvent);
                return true;
            }
        }
        if (isEnabledPrimaryLongClick) {
            if ("PrimaryLongClick" === gestureEvent.eventType) {
                console.log("PrimaryLongClick");
                const interactionEvent = new BrimboriumInteractionEvent(
                    "PrimaryLongClick",
                    gestureEvent,
                    gestureEvent.nodeRef
                );
                this.interactionOutcome?.add({ "type": "interactionEvent", interactionEvent: interactionEvent });
                return true;
            }
        }
        // TODO
        return false;
    }

    override reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        this.state = "Start";
        // TODO
    }
}
