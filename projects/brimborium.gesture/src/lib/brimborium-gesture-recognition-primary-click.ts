import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { BrimboriumGestureTypeName, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager, type IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent, createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent, createTouchBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";
import { Injectable } from "@angular/core";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { createFaultBrimboriumGestureManager } from "./brimborium-gesture-utils";
import { BrimboriumGestureResetRecognition } from "./brimborium-gesture-reset-recognition";

type BrimboriumGestureRecognitionPrimaryClickState
    = 'Start'
    | 'MouseDown'
    | 'TouchDown'
    | 'KeyDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "PrimaryClick";
@Injectable({
    providedIn: 'root',
})
export class BrimboriumGestureRecognitionPrimaryClick extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionPrimaryClickState> {
    manager: IBrimboriumGestureManager = createFaultBrimboriumGestureManager();

    constructor() {
        super(gestureRecognitionName, "Start");
    }

    override getListSupportedGestureName(): BrimboriumGestureTypeName[] {
        return [
            "PrimaryClick"
        ];
    }

    override initialize(
        manager: IBrimboriumGestureManager,
        outcome: BrimboriumGestureRecognitionOutcome
    ): void {
        this.manager = manager;
        this.outcome = outcome;
        this.ListEventRegister = [
            { gestureRecognition: gestureRecognitionName, eventType: "mousedown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mousemove", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mouseup", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "keyup", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
        ];
        this.needUpdateListEventRegister = true;
    }

    override resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>)
        ): void {
        super.resetRecognition(finished);
        this.state = "Start";
    }

    override processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        const isEnabledPrimaryClick=gestureSourceEvent.getGestureEnabled()?.has('PrimaryClick');
        const isEnabledPrimaryLongClick=gestureSourceEvent.getGestureEnabled()?.has('PrimaryLongClick');
        if (!(isEnabledPrimaryClick || isEnabledPrimaryLongClick)){ return false;}
        if ("Start" === this.state) {
            if ("mousedown" === gestureSourceEvent.eventType) {
                gestureSourceEvent.preventDefault();

                this.state = "MouseDown";
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, clientPos);
                this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                return true;
            }
        }
        if ("MouseDown" === this.state) {
            if ("mousemove" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const firstPoint = this.gestureEventChain!.ListPoints[0];
                const distance = clientPos.distanceTo(firstPoint);
                if (this.manager!.options.mouseDistanceThresholdToDrag < distance) {
                    // Mouse moved too far - this is a drag, not a click
                    this.state = 'Inactive';
                    return false;
                } else {
                    // Still within threshold - continue waiting for mouseup
                    return false;
                }
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const diffTimeStamp = gestureSourceEvent.timeStamp - this.gestureEventChain!.initialEvent.timeStamp
                if (diffTimeStamp < this.manager!.options.longClickThreshold){
                    if (isEnabledPrimaryClick){
                        const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                    }
                    this.state = 'End';
                } else {
                    if (isEnabledPrimaryLongClick){
                        const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryLongClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                    }
                    this.state = 'End';
                    this.outcome?.add({type:"gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager)})
                }
                return true;
            }
        }
        // touch events
        if ("Start" === this.state) {
            if ("touchstart" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    gestureSourceEvent.preventDefault();
                    this.state = "TouchDown";
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const gestureEvent = createTouchBrimboriumGestureEvent("TouchDown", gestureSourceEvent, clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });                    
                    return true;
                }
            }
        }
        if ("TouchDown" === this.state) {
            if ("touchmove" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const firstPoint = this.gestureEventChain!.ListPoints[0];
                    const distance = clientPos.distanceTo(firstPoint);
                    if (this.manager!.options.touchDistanceThresholdToDrag < distance) {
                        // Touch moved too far - this is a drag, not a tap
                        this.state = 'Inactive';
                        return false;
                    } else {
                        // Still within threshold - continue waiting for touchend
                        return false;
                    }
                }
            }
            if ("touchend" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.changedTouches.length === 1) {
                    const touch = touchEvent.changedTouches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent, clientPos);
                    // Append to existing chain instead of overwriting
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                    this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                    this.state = 'End';
                    this.outcome?.add({type:"gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager)})
                    return true;
                }
            }
            if ("touchcancel" === gestureSourceEvent.eventType) {
                this.state = 'Inactive';
                return false;
            }
        }

        // keyboard Space
        if ("Start" === this.state) {
            if ("keydown" === gestureSourceEvent.eventType) {
                const keyboardEvent = gestureSourceEvent.$event as KeyboardEvent;
                if (' ' === keyboardEvent.key) {
                    this.state = "KeyDown";
                    gestureSourceEvent.preventDefault();
                    // Initialize gestureEventChain for keyboard events
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, undefined);
                    const gestureEvent = createKeyboardBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent);
                    this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                }
            }
        }
        if ("KeyDown" === this.state) {
            if ("keyup" === gestureSourceEvent.eventType) {
                this.state = "End";
                gestureSourceEvent.preventDefault();
                this.outcome?.add({type:"gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager)})
                return true;
            }
        }
        return false
    }
}
