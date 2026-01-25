import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { BrimboriumGestureTypeName, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager, type IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent, createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent, createTouchBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";
import { Injectable } from "@angular/core";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { BrimboriumGestureResetRecognition } from "./brimborium-gesture-reset-recognition";

type BrimboriumGestureRecognitionKeyboardState
    = 'Start'
    | 'KeyDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "Keyboard";

export class BrimboriumGestureRecognitionKeyboard extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionKeyboardState> {
    manager: IBrimboriumGestureManager;

    constructor(manager: IBrimboriumGestureManager) {
        super(gestureRecognitionName, "Start");
        this.manager = manager;
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
            { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "keyup", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
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
                this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) })
                return true;
            }
        }
        return false
    }
}
