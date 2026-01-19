import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { IBrimboriumGestureInteraction, IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";

type BrimboriumGestureInteractionContextMenuState
    = 'Start'
    | 'Active'
    | 'End'
    ;

export class BrimboriumGestureInteractionContextMenu extends BrimboriumGestureInteraction<BrimboriumGestureInteractionContextMenuState> {
    constructor() {
        super("ContextMenu", "Start")
    }

    override processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean {
        if (gestureEvent.eventType === "SecondaryClick") {
            this.state = "Active";
            // Context menu logic would go here
            // This would typically show a context menu at the gesture position
            return true;
        }
        return false;
    }

    override reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        super.reset(finished);
        this.state = "Start";
    }
}
