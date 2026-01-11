import type { BrimboriumGestureEventType } from "./brimborium-gesture-consts";
import type { BrimboriumGestureNodeRef } from "./brimborium-gesture-node-ref";
import { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { Point2D } from "./point2d";

export class BrimboriumGestureEvent {
    constructor(
        public eventType: BrimboriumGestureEventType,
        public target: EventTarget | null,
        public timeStamp: DOMHighResTimeStamp /* number */,
        public clientPos: Point2D | undefined,
        public nodeRef: BrimboriumGestureNodeRef | undefined,
        public $event: Event,
        public shiftKey: boolean,
        public ctrlKey: boolean,
        public altKey: boolean,
        public metaKey: boolean,
    ) {
    }
}

export function createMouseBrimboriumGestureEvent(
    eventType: BrimboriumGestureEventType,
    gestureSourceEvent: BrimboriumGestureSourceEvent,
    clientPos: Point2D | undefined
): BrimboriumGestureEvent {
    const mouseEvent = gestureSourceEvent.$event as MouseEvent;
    let shiftKey: boolean = mouseEvent.shiftKey;
    let ctrlKey: boolean = mouseEvent.ctrlKey;
    let altKey: boolean = mouseEvent.altKey;
    let metaKey: boolean = mouseEvent.metaKey;

    if (clientPos == null) {
        clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
    }
    const gestureEvent = new BrimboriumGestureEvent(
        eventType,
        gestureSourceEvent.target,
        gestureSourceEvent.timeStamp,
        clientPos,
        gestureSourceEvent.nodeRef,
        gestureSourceEvent.$event,
        shiftKey,
        ctrlKey,
        altKey,
        metaKey
    );
    return gestureEvent;
}

export function createTouchBrimboriumGestureEvent(
    eventType: BrimboriumGestureEventType,
    gestureSourceEvent: BrimboriumGestureSourceEvent,
    clientPos: Point2D | undefined
): BrimboriumGestureEvent {
    const touchEvent = gestureSourceEvent.$event as TouchEvent;
    let shiftKey: boolean = touchEvent.shiftKey;
    let ctrlKey: boolean = touchEvent.ctrlKey;
    let altKey: boolean = touchEvent.altKey;
    let metaKey: boolean = touchEvent.metaKey;
    
    if (clientPos == null) {
        const changedTouches = touchEvent.changedTouches;
        if (0 < changedTouches.length) {
            const changedTouch = changedTouches[changedTouches.length - 1];
            clientPos = new Point2D(changedTouch.clientX, changedTouch.clientY);
        }
    }
    const gestureEvent = new BrimboriumGestureEvent(
        eventType,
        gestureSourceEvent.target,
        gestureSourceEvent.timeStamp,
        clientPos,
        gestureSourceEvent.nodeRef,
        gestureSourceEvent.$event,
        shiftKey,
        ctrlKey,
        altKey,
        metaKey
    );
    return gestureEvent;
}

export function createKeyboardBrimboriumGestureEvent(
    eventType: BrimboriumGestureEventType,
    gestureSourceEvent: BrimboriumGestureSourceEvent
): BrimboriumGestureEvent {
    const keyboardEvent = gestureSourceEvent.$event as KeyboardEvent;
    let shiftKey: boolean = keyboardEvent.shiftKey;
    let ctrlKey: boolean = keyboardEvent.ctrlKey;
    let altKey: boolean = keyboardEvent.altKey;
    let metaKey: boolean = keyboardEvent.metaKey;
    const gestureEvent = new BrimboriumGestureEvent(
        eventType,
        gestureSourceEvent.target,
        gestureSourceEvent.timeStamp,
        undefined,
        gestureSourceEvent.nodeRef,
        gestureSourceEvent.$event,
        shiftKey,
        ctrlKey,
        altKey,
        metaKey
    );
    return gestureEvent;
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
