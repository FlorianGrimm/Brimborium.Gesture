import {
    IBrimboriumGestureEffect,
    IBrimboriumGestureRecognition,
    IBrimboriumGestureManager,
    BrimboriumGestureRecognitionName,
    ItemBrimboriumGestureRecognitionOutcome,
    BrimboriumGestureTypeName,
} from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEvent, BrimboriumGestureSourceEventChain } from "./brimborium-gesture-source-event";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";

export class BrimboriumGestureRecognition<State extends string> implements IBrimboriumGestureRecognition<State> {
    public readonly name: BrimboriumGestureRecognitionName;
    public gestureEventChain: BrimboriumGestureSourceEventChain | undefined = undefined;

    constructor(
        name: BrimboriumGestureRecognitionName,
        state: State
    ) {
        this.name = name;
        this.state = state;
        this.outcome=undefined;
    }

    getListSupportedGestureName(): BrimboriumGestureTypeName[] { return []; }

    initialize(
        manager: IBrimboriumGestureManager,
        outcome: BrimboriumGestureRecognitionOutcome
    ): void {
        this.outcome = outcome;
    }

    ListEventRegister: GestureEventRegister[] = [];
    getListEventRegister(): GestureEventRegister[] {
        return this.ListEventRegister;
    }
    needUpdateListEventRegister: boolean = false;

    state: State;

    readyforInputSourceEvent(): boolean { return true; }

    processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        return false;
    }

    resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>)
        ): void {
        this.gestureEventChain = undefined;
    }

    outcome: BrimboriumGestureRecognitionOutcome|undefined;
}

