import type { Signal } from "@angular/core";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import type { BrimboriumGesture } from "./brimborium-gesture";
import type { BrimboriumGestureOptions } from "./brimborium-gesture-options";
import type { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import type { BrimboriumInteractionEvent } from "./brimborium-interaction-event";
import type { BrimboriumGestureInteractionOutcome } from "./brimborium-gesture-interaction-outcome";
import type { BrimboriumGestureNodeRef } from "./brimborium-gesture-node-ref";
import { BrimboriumGestureResetRecognition } from "./brimborium-gesture-reset-recognition";
import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";

export type BrimboriumGestureRecognitionName
    = 'PrimaryClick'
    | 'SecondaryClick'
    | 'ContextMenu'
    | 'DragNDrop'
    | 'Reposition'
    ;

export interface IBrimboriumGestureManager {
    readonly options: BrimboriumGestureOptions;
    
    // getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined;
    // getInteractionAllowed(): SourceArrayValue<BrimboriumInteractionName> | undefined;
    getGestureEnabled(): Set<BrimboriumGestureTypeName>;
    setGestureEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean;
    getInteractionEnabled(): Set<BrimboriumInteractionTypeName>;
    setInteractionEnabled(name: BrimboriumInteractionTypeName, isEnabled: boolean): boolean;
    
    calcGestureEnabled(
        interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined
    ): Set<BrimboriumGestureTypeName> | undefined;
    
    // readonly stateMaschine: BrimboriumGestureStateMaschine;
    // setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery): void;
    // isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn;
    // onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: GestureSourceEvent): void;
    eventPreventDefault($event: Event): void;
    
    processGestureEvent(gestureEvent: BrimboriumGestureEvent): void;
    resetGestureRecognition(callee: BrimboriumGestureRecognition<any>): void;

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
    | 'PrimaryLongClick'
    | 'SecondaryClick'
    | 'SecondaryLongClick'
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
    | 'PrimaryLongClick'
    | 'SecondaryClick'
    | 'SecondaryLongClick'
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
        manager: IBrimboriumGestureManager,
        listOutcome: BrimboriumGestureRecognitionOutcome): void;

    getListEventRegister(): GestureEventRegister[];
    needUpdateListEventRegister: boolean;

    state: State;
    readyforInputSourceEvent(): boolean;
    processGestureSourceEvent(
        gestureSourceEvent: BrimboriumGestureSourceEvent
    ): boolean;
    resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>)
    ): void;

    outcome: BrimboriumGestureRecognitionOutcome|undefined;
}

export type ArrayBrimboriumGestureRecognitionOutcome = ItemBrimboriumGestureRecognitionOutcome[];
export type ItemBrimboriumGestureRecognitionOutcome
    = { type: 'gestureEvent'; gestureEvent: BrimboriumGestureEvent; handled?:boolean; }
    // TODO: effect need a nodeRef
    | { type: 'gestureEffect'; effect: IBrimboriumGestureEffect; handled?:boolean; }
    ;

export interface IBrimboriumGestureEffect {
    enter(/* which info does the method need? mousepos... */): void;
    leave(): void;
}

export type ItemBrimboriumGestureInteractionOutcome
    = { type: 'interactionEvent'; interactionEvent: BrimboriumInteractionEvent; handled?:boolean; }
    | { type: 'iteractionEffect'; effect: IBrimboriumIteractionEffect; handled?:boolean; }
    ;

export interface IBrimboriumIteractionEffect {
    nodeRef: BrimboriumGestureNodeRef | undefined;
    enter(/* which info does the method need? mousepos... */): void;
    leave(): void;
}

export interface IBrimboriumGestureInteraction<State = any> {
    name: string;
    interactionOutcome: BrimboriumGestureInteractionOutcome|undefined;

    getListSupportedInteractionName(): readonly BrimboriumInteractionTypeName[];
    getListNeededGesture(interactionName: BrimboriumInteractionTypeName): readonly BrimboriumGestureTypeName[];

    state: State;
    /**
     * process the gesture event - return true to stop processing - return false to continue
     * @param gestureEvent to handle
     */
    processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean;
    reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void;

    //effect?: IBrimboriumGestureEffect
}

export type SourceArrayValue<T> =
    Signal<T[]>
    | { getValue(): T[]; }
    | T[]
    | Set<T>
    ;