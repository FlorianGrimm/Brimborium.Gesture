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
        public $event: Event
    ) {
    }
}

export function createMouseBrimboriumGestureEvent(
    eventType: BrimboriumGestureEventType,
    gestureSourceEvent: BrimboriumGestureSourceEvent,
    clientPos: Point2D | undefined
): BrimboriumGestureEvent {
    if (clientPos == null) {
        const mouseEvent = gestureSourceEvent.$event as MouseEvent;
        clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
    }
    const gestureEvent = new BrimboriumGestureEvent(
        eventType,
        gestureSourceEvent.target,
        gestureSourceEvent.timeStamp,
        clientPos,
        gestureSourceEvent.nodeRef,
        gestureSourceEvent.$event
    );
    return gestureEvent;
}

export function createKeyboardBrimboriumGestureEvent(
    eventType: BrimboriumGestureEventType,
    gestureSourceEvent: BrimboriumGestureSourceEvent
): BrimboriumGestureEvent {
    const gestureEvent = new BrimboriumGestureEvent(
        eventType,
        gestureSourceEvent.target,
        gestureSourceEvent.timeStamp,
        undefined,
        gestureSourceEvent.nodeRef,
        gestureSourceEvent.$event
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
