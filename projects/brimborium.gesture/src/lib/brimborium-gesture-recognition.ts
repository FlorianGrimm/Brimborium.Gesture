import {
    IBrimboriumGestureEffect,
    IBrimboriumGestureRecognition,
    IBrimboriumGestureManager,
    BrimboriumGestureRecognitionName,
    ItemBrimboriumGestureRecognitionOutcome,
    BrimboriumGestureTypeName,
} from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEvent, BrimboriumGestureSourceEventChain } from "./brimborium-gesture-source-event";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
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
        this.outcome=new BrimboriumGestureRecognitionOutcome();
    }

    getListSupportedGestureName(): BrimboriumGestureTypeName[] { return []; }

    initialize(
        stateMaschine: BrimboriumGestureStateMaschine,
        manager: IBrimboriumGestureManager,
        outcome: BrimboriumGestureRecognitionOutcome): void {
        this.outcome = outcome;
    }

    ListEventRegister: GestureEventRegister[] = [];
    getListEventRegister(): GestureEventRegister[] {
        return this.ListEventRegister;
    }
    needUpdateListEventRegister: boolean = false;

    state: State;

    readyforInputSourceEvent(): boolean { return false; }

    processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        return false;
    }

    resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>[]),
        outcome: BrimboriumGestureRecognitionOutcome
        ): void {
        this.outcome = outcome;
        this.gestureEventChain = undefined;
    }

    outcome: BrimboriumGestureRecognitionOutcome;
}

