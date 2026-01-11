import {
    BrimboriumGestureRecognitionOutcome,
    IBrimboriumGestureEffect,
    IBrimboriumGestureRecognition,
    IBrimboriumGestureManager,
    BrimboriumGestureRecognitionName,
} from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEvent, BrimboriumGestureSourceEventChain } from "./brimborium-gesture-source-event";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";

export class BrimboriumGestureRecognition<State extends string> implements IBrimboriumGestureRecognition<State> {
    public readonly name: BrimboriumGestureRecognitionName;
    public gestureEventChain: BrimboriumGestureSourceEventChain | undefined = undefined;

    constructor(
        name: BrimboriumGestureRecognitionName,
        state: State
    ) {
        this.name = name;
        this.state = state;
    }

    initialize(
        stateMaschine: BrimboriumGestureStateMaschine,
        manager: IBrimboriumGestureManager): void {
    }

    ListEventRegister: GestureEventRegister[] = [];
    getListEventRegister(): GestureEventRegister[] {
        return this.ListEventRegister;
    }
    needUpdateListEventRegister: boolean = false;

    state: State;
    
    readyforInputSourceEvent(): boolean { return false; }

    process(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        return false;
    }

    reset(): void {
        this.gestureEventChain = undefined;
    }

    listOutcome: BrimboriumGestureRecognitionOutcome;
}

