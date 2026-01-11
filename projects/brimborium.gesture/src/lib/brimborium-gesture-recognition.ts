import {
    BrimboriumGestureRecognitionOutcome,
    IBrimboriumGestureEffect,
    BrimboriumGestureSourceEvent,
    BrimboriumGestureSourceEventChain,
    IBrimboriumGestureRecognition,
    IBrimboriumGestureManager,
} from "./brimborium-gesture-consts";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";

export class BrimboriumGestureRecognition<State extends string> implements IBrimboriumGestureRecognition<State> {
    public readonly name: string;
    public gestureEventChain = new BrimboriumGestureSourceEventChain();

    constructor(
        name: string,
        state: State
    ) {
        this.name = name;
        this.state = state;
    }

    initialize(
        stateMaschine: BrimboriumGestureStateMaschine,
        manager:IBrimboriumGestureManager): void {
    }

    ListEventRegister: GestureEventRegister[] = [];
    getListEventRegister(): GestureEventRegister[] {
        return this.ListEventRegister;
    }
    needUpdateListEventRegister: boolean = false;

    state: State;
    readyforInputSourceEvent(): boolean { return false; }
    process(gestureEvent: BrimboriumGestureSourceEvent): boolean {
        return false;
    }

    reset(): void {
        //this._state = BrimboriumGestureRecognitionState.Start;
        this.gestureEventChain.reset();
    }

    listOutcome: BrimboriumGestureRecognitionOutcome;
}

