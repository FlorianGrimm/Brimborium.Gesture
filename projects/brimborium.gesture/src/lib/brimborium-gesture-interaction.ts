import type { IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";

export class BrimboriumGestureInteraction<State> implements IBrimboriumGestureInteraction<State> {
    readonly name: string;

    constructor(
        name: string,
        state: State
    ) {
        this.name = name;
        this.state = state;
    }

    state: State;

    process(gestureEvent: BrimboriumGestureEvent): boolean {
        return false;
    }

    reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        return;
    }
}
