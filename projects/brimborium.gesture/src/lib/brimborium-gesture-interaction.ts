import type { BrimboriumGestureTypeName, BrimboriumInteractionTypeName, IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { BrimboriumGestureInteractionOutcome } from "./brimborium-gesture-interaction-outcome";
import type { BrimboriumInteractionEvent } from "./brimborium-interaction-event";

export class BrimboriumGestureInteractionEventChain {
    list: BrimboriumInteractionEvent[] = [];
    add(interactionEvent: BrimboriumInteractionEvent) {
        this.list.push(interactionEvent);
    }
    getFirst(): BrimboriumInteractionEvent | undefined {
        if (0 === this.list.length) {
            return undefined;

        } else {
            return this.list[0];
        }
    }
    getLast(): BrimboriumInteractionEvent | undefined {
        if (0 === this.list.length) {
            return undefined;

        } else {
            return this.list[this.list.length - 1];
        }
    }
    clear() {
        if (0 < this.list.length) {
            this.list.splice(0, this.list.length)
        }
    }
}

export class BrimboriumGestureInteraction<State> implements IBrimboriumGestureInteraction<State> {
    readonly name: string;
    interactionOutcome: BrimboriumGestureInteractionOutcome | undefined;
    interactionEventChain: BrimboriumGestureInteractionEventChain;

    constructor(
        name: string,
        state: State
    ) {
        this.name = name;
        this.state = state;
        this.interactionEventChain = new BrimboriumGestureInteractionEventChain();
    }

    getListSupportedInteractionName(): readonly BrimboriumInteractionTypeName[] { return []; }
    getListNeededGesture(interactionName: BrimboriumInteractionTypeName): readonly BrimboriumGestureTypeName[] { return []; }

    state: State;

    processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean {
        return false;
    }

    reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        this.interactionEventChain = new BrimboriumGestureInteractionEventChain();
        return;
    }
}
