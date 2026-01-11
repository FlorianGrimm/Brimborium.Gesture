import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { Point2D } from "./point2d";
import type { IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";

type BrimboriumGestureInteractionSecondaryClickState
    = 'Start'
    | 'Dragging'
    | 'End'
    ;

export class BrimboriumGestureInteractionSecondaryClick extends BrimboriumGestureInteraction<BrimboriumGestureInteractionSecondaryClickState> {
    constructor(){
        super("SecondaryClick", "Start")
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
