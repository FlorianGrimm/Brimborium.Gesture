import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { BrimboriumGestureTypeName, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager, type IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent, createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent, createTouchBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";
import { Injectable } from "@angular/core";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { createFaultBrimboriumGestureManager } from "./brimborium-gesture-utils";
import { BrimboriumGestureResetRecognition } from "./brimborium-gesture-reset-recognition";

type BrimboriumGestureRecognitionTouchState
    = 'Start'
    | 'TouchDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "Touch";

export class BrimboriumGestureRecognitionTouch extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionTouchState> {
    manager: IBrimboriumGestureManager;

    constructor(manager: IBrimboriumGestureManager) {
        super(gestureRecognitionName, "Start");
        this.manager=manager;
    }

    override getListSupportedGestureName(): BrimboriumGestureTypeName[] {
        return [
            'PrimaryClick',
            'PrimaryLongClick',
            'SecondaryClick',
            'SecondaryLongClick',
            'DragNDrop',
            'Reposition',
            'Resize',
            'Pan',
            'Swipe',
            'Pinch',
            'Rotate'
        ];
    }

    override initialize(
        manager: IBrimboriumGestureManager,
        outcome: BrimboriumGestureRecognitionOutcome
    ): void {
        this.manager = manager;
        this.outcome = outcome;
        this.ListEventRegister = [
            // { gestureRecognition: gestureRecognitionName, eventType: "mousedown", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "mousemove", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "mouseup", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "keyup", active: true },
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

    handlerTimeout: number = 0;

    override processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        const isEnabledPrimaryClick = gestureSourceEvent.getGestureEnabled()?.has('PrimaryClick');
        const isEnabledPrimaryLongClick = gestureSourceEvent.getGestureEnabled()?.has('PrimaryLongClick');
        
        const isEnabledSecondaryClick = gestureSourceEvent.getGestureEnabled()?.has('SecondaryClick');
        const isEnabledSecondaryLongClick = gestureSourceEvent.getGestureEnabled()?.has('SecondaryLongClick');
        
        const isEnabledDragNDrop = gestureSourceEvent.getGestureEnabled()?.has('DragNDrop');
        const isEnabledReposition = gestureSourceEvent.getGestureEnabled()?.has('Reposition');
        const isEnabledResize = gestureSourceEvent.getGestureEnabled()?.has('Resize');
        const isEnabledPan = gestureSourceEvent.getGestureEnabled()?.has('Pan');
        const isEnabledSwipe = gestureSourceEvent.getGestureEnabled()?.has('Swipe');
        const isEnabledPinch = gestureSourceEvent.getGestureEnabled()?.has('Pinch');
        const isEnabledRotate = gestureSourceEvent.getGestureEnabled()?.has('Rotate');

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
                    this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) })
                    return true;
                }
            }
            if ("touchcancel" === gestureSourceEvent.eventType) {
                this.state = 'Inactive';
                return false;
            }
        }
        return false
    }
}
