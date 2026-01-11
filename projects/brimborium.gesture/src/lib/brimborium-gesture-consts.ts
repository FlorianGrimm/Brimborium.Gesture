import { Signal } from "@angular/core";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import type { BrimboriumGesture } from "./brimborium-gesture";
import type { BrimboriumGestureOptions } from "./brimborium-gesture-options";
import type { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import { publishFacade } from "@angular/compiler";

export type BrimboriumGestureRecognitionName
    = 'PrimaryClick'
    | 'SecondaryClick'
    | 'ContextMenu'
    | 'DragNDrop'
    | 'Reposition'
    ;

export interface IBrimboriumGestureManager {
    getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined;
    options: BrimboriumGestureOptions;
    // readonly stateMaschine: BrimboriumGestureStateMaschine;
    // setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery): void;
    // isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn;
    // onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: GestureSourceEvent): void;
    eventPreventDefault($event: Event): void;

    processGestureEvent(gestureEvent: BrimboriumGestureEvent): void;

    //createDragEffect(): IBrimboriumGestureEffect;
}
export interface IBrimboriumGestureRoot {
    registerGesture(element: HTMLElement, value: BrimboriumGesture): void;
}
export interface IBrimboriumGestureEventRegistery {
    register(listEventRegister: GestureEventRegister[], gestureRecognition: string | undefined): void;
}


export enum IsInterestingOn {
    No,
    Yes,
    YesIfNodeRef
}

export type GestureSourceEventName
    = 'mousedown'
    | 'mouseup'
    | 'mousemove'
    | 'mouseenter'
    | 'mouseover'
    | 'mouseleave'

    | 'touchstart'
    | 'touchmove'
    | 'touchend'

    | keyof (GlobalEventHandlersEventMap)

    ;

export const MouseGestureEventName: GestureSourceEventName[] = [
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseenter',
    'mouseover',
    'mouseleave',
];

export const TouchGestureEventName: GestureSourceEventName[] = [
    'touchstart',
    'touchmove',
    'touchend',
];

export type BrimboriumGestureName = string;


export type BrimboriumGestureEventType
    = 'MouseDown'
    | 'MouseMove'
    | 'PrimaryClick'
    | 'SecondaryClick'
    | 'DragStart'
    | 'DragEnter'
    | 'DragMove'
    | 'DragLeave'
    | 'DragEnd'
    | 'DragCancel'
    ;

export type BrimboriumGestureRecognitionState
    = 'Start'
    //| 'Active'
    | 'Inactive'
    | 'End';

export interface IBrimboriumGestureRecognition<State extends string = string> {
    name: string;

    // get state(): BrimboriumGestureRecognitionState;
    // setState(value: BrimboriumGestureRecognitionState):void;

    initialize(
        stateMaschine: BrimboriumGestureStateMaschine,
        manager: IBrimboriumGestureManager): void;

    getListEventRegister(): GestureEventRegister[];
    needUpdateListEventRegister: boolean;

    state: State;
    readyforInputSourceEvent(): boolean;
    process(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean;
    reset(finished: undefined | (IBrimboriumGestureRecognition<string>[])): void;

    listOutcome: BrimboriumGestureRecognitionOutcome;
}

export type BrimboriumGestureRecognitionOutcome = undefined | ArrayBrimboriumGestureRecognitionOutcome;
export type ArrayBrimboriumGestureRecognitionOutcome = ItemBrimboriumGestureRecognitionOutcome[];
export type ItemBrimboriumGestureRecognitionOutcome
    = { type: 'gestureEvent'; gestureEvent: BrimboriumGestureEvent }
    | { type: 'effect'; effect: IBrimboriumGestureEffect };

export interface IBrimboriumGestureEffect {
    enter(/* which info does the method need? mousepos... */): void;
    leave(): void;
}

export interface IBrimboriumGestureInteraction<State=any> {
    name:string;

    state: State;
    process(gestureEvent: BrimboriumGestureEvent): boolean;
    reset(): void

    //effect?: IBrimboriumGestureEffect
}

export type SourceArrayValue<T> =
    Signal<T[]>
    | { getValue(): T[]; }
    | T[]
    | Set<T>
    // | null 
    // | undefined
    ;

class FaultBrimboriumGestureManager implements IBrimboriumGestureManager {
    getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined { throw new Error("Not Allowed."); }
    public get options(): BrimboriumGestureOptions { throw new Error("Not Allowed."); }
    public set options(value: BrimboriumGestureOptions) { throw new Error("Not Allowed."); }
    eventPreventDefault($event: Event): void { throw new Error("Not Allowed."); }
    processGestureEvent(gestureEvent: BrimboriumGestureEvent): void { throw new Error("Not Allowed."); }
}
const faultBrimboriumGestureManager = new FaultBrimboriumGestureManager();
export function createFaultBrimboriumGestureManager(): IBrimboriumGestureManager { return faultBrimboriumGestureManager; }
