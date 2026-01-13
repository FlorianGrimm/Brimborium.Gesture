import type { Signal } from "@angular/core";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import type { BrimboriumGesture } from "./brimborium-gesture";
import type { BrimboriumGestureOptions } from "./brimborium-gesture-options";
import type { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";

export type BrimboriumGestureRecognitionName
    = 'PrimaryClick'
    | 'SecondaryClick'
    | 'ContextMenu'
    | 'DragNDrop'
    | 'Reposition'
    ;

export interface IBrimboriumGestureManager {
    options: BrimboriumGestureOptions;

    // getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined;
    // getInteractionAllowed(): SourceArrayValue<BrimboriumInteractionName> | undefined;
    getGestureEnabled(): Set<BrimboriumGestureTypeName>;
    setGestureEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean;
    getInteractionEnabled(): Set<BrimboriumInteractionTypeName>;
    setInteractionEnabled(name: BrimboriumInteractionTypeName, isEnabled: boolean): boolean;
    
    calcGestureEnabled(
        interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined, 
        gestureEnabled: SourceArrayValue<BrimboriumGestureTypeName> | undefined
    ): Set<BrimboriumGestureTypeName> | undefined;

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

export type BrimboriumGestureTypeName =
    'PrimaryClick'
    | 'SecondaryClick'
    | 'DragNDrop'
    | 'Reposition'
    | 'Resize'
    | 'Pan'
    | 'Swipe'
    | 'Pinch'
    | 'Rotate'
    ;
export type BrimboriumInteractionTypeName =
    'PrimaryClick'
    | 'PrimaryDoubleClick'
    | 'PrimaryLongClick'
    | 'SecondaryClick'
    | 'SecondaryDoubleClick'
    | 'SecondaryLongClick'
    | 'DragNDrop'
    | 'Reposition'
    | 'Resize'
    | 'Pan'
    | 'Swipe'
    | 'Pinch'
    | 'Rotate'
    ;

export type BrimboriumGestureEventType
    = 'MouseDown'
    | 'MouseMove'
    | 'TouchDown'
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

    getListSupportedGestureName(): BrimboriumGestureTypeName[];

    initialize(
        stateMaschine: BrimboriumGestureStateMaschine,
        manager: IBrimboriumGestureManager,
        listOutcome: BrimboriumGestureRecognitionOutcome): void;

    getListEventRegister(): GestureEventRegister[];
    needUpdateListEventRegister: boolean;

    state: State;
    readyforInputSourceEvent(): boolean;
    processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean;
    resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>[]),
        listOutcome: BrimboriumGestureRecognitionOutcome): void;

    outcome: BrimboriumGestureRecognitionOutcome;
}

export type ArrayBrimboriumGestureRecognitionOutcome = ItemBrimboriumGestureRecognitionOutcome[];
export type ItemBrimboriumGestureRecognitionOutcome
    = { type: 'gestureEvent'; gestureEvent: BrimboriumGestureEvent }
    | { type: 'effect'; effect: IBrimboriumGestureEffect };

export interface IBrimboriumGestureEffect {
    enter(/* which info does the method need? mousepos... */): void;
    leave(): void;
}

export interface IBrimboriumGestureInteraction<State = any> {
    name: string;

    getListSupportedInteractionName(): readonly BrimboriumInteractionTypeName[];
    getListNeededGesture(interactionName: BrimboriumInteractionTypeName): readonly BrimboriumGestureTypeName[];

    state: State;
    process(gestureEvent: BrimboriumGestureEvent): boolean;
    reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void;

    //effect?: IBrimboriumGestureEffect
}

export type SourceArrayValue<T> =
    Signal<T[]>
    | { getValue(): T[]; }
    | T[]
    | Set<T>
    ;