import type { BrimboriumGestureNodeRef } from "./brimborium-gesture-node-ref";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import { Point2D } from "./point2d";
import { BrimboriumGesture } from "./brimborium-gesture";
import { isSignal, Signal } from "@angular/core";

export interface IBrimboriumGestureManager {
    getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined;
    // readonly stateMaschine: BrimboriumGestureStateMaschine;
    // setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery): void;
    // isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn;
    // onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: GestureSourceEvent): void;
    eventPreventDefault($event: Event): void;
    
    createDragEffect(): IBrimboriumGestureEffect;
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

export class BrimboriumGestureSourceEvent {
    public static ensureTargetHTMLElement(target: EventTarget | null): HTMLElement | null {
        const targetElement = target as HTMLElement | null;
        if (targetElement == null) {
            return null;
        } else {
            if (1 === targetElement.nodeType) {
                return targetElement;
            } else {
                return null;
            }
        }
    }

    constructor(
        public eventType: GestureSourceEventName,
        public target: EventTarget | null,
        public timeStamp: DOMHighResTimeStamp /* number */,
        public nodeRef: BrimboriumGestureNodeRef | undefined,
        public $event: Event,
        public manager: IBrimboriumGestureManager
    ) {
    }

    public eventPreventDefault: boolean = false;
    public preventDefault() { this.eventPreventDefault = true; }

    private _GestureAllowed: Set<BrimboriumGestureName> | null | undefined = null;
    public getGestureAllowed(): Set<BrimboriumGestureName> | undefined {
        if (this._GestureAllowed !== null) { return this._GestureAllowed; }
        return this._GestureAllowed = combineGestureAllowed(
            this.manager.getGestureAllowed(),
            this.nodeRef?.gesture?.gestureAllowed());
    }

}
export type BrimboriumGestureName = string;

export class BrimboriumGestureSourceEventChain {
    initialEvent: BrimboriumGestureSourceEvent;
    previousEvent: BrimboriumGestureSourceEvent | undefined;
    lastEvent: BrimboriumGestureSourceEvent;
    ListPoints: Point2D[] = [];

    constructor() {
        this._needReset = true;
        this.initialEvent = this.lastEvent = new BrimboriumGestureSourceEvent(undefined as any, undefined as any, undefined as any, undefined as any, undefined as any, undefined);
    }

    private _needReset: boolean = false;
    public reset() {
        this._needReset = true;
    }

    public setEvent(
        event: BrimboriumGestureSourceEvent,
        point: Point2D | undefined
    ) {
        if (this._needReset) {
            this._needReset = false;
            this.initialEvent = event;
            this.lastEvent = event;
            this.ListPoints.length = 0;
        } else {
            this.previousEvent = this.lastEvent;
            this.lastEvent = event;
        }
        if (point != null) {
            this.ListPoints.push(point);
        }
    }
}

export type BrimboriumGestureEventType
    = 'primaryClick'
    | 'secondaryClick'
    | 'dragStart'
    | 'dragEnter'
    | 'dragMove'
    | 'dragLeave'
    | 'dragEnd'
    | 'dragCancel'
    ;

export class BrimboriumGestureEvent {
    constructor(
        public eventType: BrimboriumGestureEventType,
        public target: EventTarget | null,
        public timeStamp: DOMHighResTimeStamp /* number */,
        public clientPos: Point2D | undefined,
        public nodeRef: BrimboriumGestureNodeRef | undefined,
        public $event: Event
    ) {
    }
}

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
    process(gestureEvent: BrimboriumGestureSourceEvent): boolean;
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

export type SourceArrayValue<T> =
    Signal<T[]>
    | { getValue(): T[]; }
    | T[]
    | Set<T>
    // | null 
    // | undefined
    ;
export function combineGestureAllowed(
    value1: SourceArrayValue<BrimboriumGestureName> | null | undefined,
    value2: SourceArrayValue<BrimboriumGestureName> | null | undefined
): Set<BrimboriumGestureName> | undefined {
    if (value1 == null && value2 == null) { return undefined }
    let listValue1 = sourceArrayValueAsIteratorLike(value1);
    let listValue2 = sourceArrayValueAsIteratorLike(value2);

    if (listValue1 == null && listValue2 == null) {
        return undefined;
    }
    if (listValue1 != null && listValue2 == null) {
        return new Set<BrimboriumGestureName>(listValue1);
    }
    if (listValue1 == null && listValue2 != null) {
        return new Set<BrimboriumGestureName>(listValue2);
    }
    if (listValue1 != null && listValue2 != null) {
        let result = new Set<BrimboriumGestureName>(listValue1);
        for (const value of listValue2) {
            result.add(value);
        }
        return result;
    }
    return undefined;
}

function sourceArrayValueAsIteratorLike(value1: SourceArrayValue<BrimboriumGestureName> | null | undefined) {
    let result: BrimboriumGestureName[] | SetIterator<BrimboriumGestureName> | undefined = undefined;
    if (value1 == null) {
        result = undefined;
    } else if (Array.isArray(value1)) {
        result = value1;
    } else if (isSignal(value1)) {
        result = value1();
    } else if (value1 instanceof Set) {
        result = value1.values();
    } else if ("function" === typeof (value1.getValue)) {
        result = value1.getValue();
    }
    return result;
}
/*

isTrusted
screenX
screenY
clientX
clientY
ctrlKey
shiftKey
altKey
metaKey
button
buttons
relatedTarget
pageX
pageY
x
y
offsetX
offsetY
movementX
movementY
fromElement
toElement
layerX
layerY
getModifierState
initMouseEvent
view
detail
sourceCapabilities
which
initUIEvent
type
target
currentTarget
eventPhase
bubbles
cancelable
defaultPrevented
composed
timeStamp
srcElement
returnValue
cancelBubble
NONE
CAPTURING_PHASE
AT_TARGET
BUBBLING_PHASE
composedPath
initEvent
preventDefault
stopImmediatePropagation
stopPropagation
*/