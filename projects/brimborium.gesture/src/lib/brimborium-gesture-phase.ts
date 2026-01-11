import { BrimboriumGestureSourceEvent } from "./brimborium-gesture-consts";

export class BrimboriumGesturePhase {
    constructor() { }

    handle(gestureEvent: BrimboriumGestureSourceEvent): BrimboriumGesturePhaseHandle | undefined {
        return undefined;
    }
}

export type BrimboriumGesturePhaseHandle = Partial<{
    remove: boolean;
    replace: BrimboriumGesturePhase;
    effect: BrimboriumGesturePhaseEffect;
}>;

export type BrimboriumGesturePhaseEffect = {
    enter():void;
    changePhase(nextPhase:BrimboriumGesturePhase):boolean;
    leave():void;
}