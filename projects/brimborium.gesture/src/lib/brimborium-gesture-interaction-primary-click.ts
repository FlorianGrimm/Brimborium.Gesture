import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { Point2D } from "./point2d";
import type { IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";

type BrimboriumGestureInteractionPrimaryClickState
    = 'Start'
    | 'Dragging'
    | 'End'
    ;

export class BrimboriumGestureInteractionPrimaryClick extends BrimboriumGestureInteraction<BrimboriumGestureInteractionPrimaryClickState> {
    constructor(){
        super("PrimaryClick", "Start")
    }

    override process(gestureEvent: BrimboriumGestureEvent): boolean {
        // TODO
        return false;
    }

    override reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        this.state = "Start";
        // TODO
    }
}
