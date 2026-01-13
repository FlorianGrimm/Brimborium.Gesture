import { isSignal } from "@angular/core";
import type { BrimboriumGestureTypeName, BrimboriumInteractionTypeName, GestureSourceEventName, IBrimboriumGestureManager, SourceArrayValue } from "./brimborium-gesture-consts";
import type { BrimboriumGestureNodeRef } from "./brimborium-gesture-node-ref";
import type { Point2D } from "./point2d";

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

    private _GestureEnabled: Set<BrimboriumGestureTypeName> | null | undefined = null;
    public getGestureEnabled(): Set<BrimboriumGestureTypeName> | undefined {
        if (this._GestureEnabled !== null) { return this._GestureEnabled; }

        const interactionEnabled = this.getInteractionEnabled();
        const gestureEnabled = this.nodeRef?.gesture?.gestureEnabled()
        return this.manager.calcGestureEnabled(interactionEnabled, gestureEnabled);
    }

    private _InteractionEnabled: Set<BrimboriumInteractionTypeName> | null | undefined = null;
    public getInteractionEnabled() {
        if (this._InteractionEnabled !== null) { return this._InteractionEnabled; }

        return combineStringAllowed<BrimboriumInteractionTypeName>(
            this.manager.getInteractionEnabled(),
            this.nodeRef?.gesture?.interactionEnabled()
        );
    }
}


export class BrimboriumGestureSourceEventChain {
    initialEvent: BrimboriumGestureSourceEvent;
    previousEvent: BrimboriumGestureSourceEvent | undefined;
    lastEvent: BrimboriumGestureSourceEvent;
    ListPoints: Point2D[] = [];

    constructor(
        event: BrimboriumGestureSourceEvent,
        point: Point2D | undefined) {
        this.initialEvent = this.lastEvent = event;
        if (point != null) {
            this.ListPoints.push(point);
        }
    }

    public appendEvent(
        event: BrimboriumGestureSourceEvent,
        point: Point2D | undefined
    ) {
        this.previousEvent = this.lastEvent;
        this.lastEvent = event;

        if (point != null) {
            this.ListPoints.push(point);
        }
    }
}

// BrimboriumGestureName
export function combineStringAllowed<T>(
    value1: SourceArrayValue<T> | null | undefined,
    value2: SourceArrayValue<T> | null | undefined
): Set<T> | undefined {
    if (value1 == null && value2 == null) { return undefined }
    let listValue1 = sourceArrayValueAsIteratorLike(value1);
    let listValue2 = sourceArrayValueAsIteratorLike(value2);

    if (listValue1 == null && listValue2 == null) {
        return undefined;
    }
    if (listValue1 != null && listValue2 == null) {
        return new Set<T>(listValue1);
    }
    if (listValue1 == null && listValue2 != null) {
        return new Set<T>(listValue2);
    }
    if (listValue1 != null && listValue2 != null) {
        let result = new Set<T>(listValue1);
        for (const value of listValue2) {
            result.add(value);
        }
        return result;
    }
    return undefined;
}

export function sourceArrayValueAsIteratorLike<T>(value1: SourceArrayValue<T> | null | undefined) {
    let result: T[] | SetIterator<T> | undefined = undefined;
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
