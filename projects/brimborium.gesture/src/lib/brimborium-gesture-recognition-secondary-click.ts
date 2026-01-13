import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import {
    type BrimboriumGestureRecognitionName,
    type IBrimboriumGestureManager,
    type IBrimboriumGestureRecognition
} from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { createFaultBrimboriumGestureManager } from "./brimborium-gesture-utils";

type BrimboriumGestureRecognitionSecondaryClickState
    = 'Start'
    | 'MouseDown'
    | 'KeyDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "SecondaryClick";

export class BrimboriumGestureRecognitionSecondaryClick extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionSecondaryClickState> {
    manager: IBrimboriumGestureManager = createFaultBrimboriumGestureManager();

    constructor() {
        super(gestureRecognitionName, "Start");
    }

    override initialize(stateMaschine: BrimboriumGestureStateMaschine, manager: IBrimboriumGestureManager): void {
        this.manager = manager;
        this.ListEventRegister = [
            { gestureRecognition: gestureRecognitionName, eventType: "mousedown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mousemove", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mouseup", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "contextmenu", active: true },
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
        finished: undefined | (IBrimboriumGestureRecognition<string>[]),
        outcome: BrimboriumGestureRecognitionOutcome): void {
        super.resetRecognition(finished, outcome);
        this.state = "Start";
    }

    override processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        // Mouse right-click
        if ("Start" === this.state) {
            if ("mousedown" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                if (mouseEvent.button === 2) { // Right mouse button
                    gestureSourceEvent.preventDefault();
                    this.state = "MouseDown";
                    const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                    const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    this.outcome.addOutcome({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                }
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
            if ("contextmenu" === gestureSourceEvent.eventType) {
                gestureSourceEvent.preventDefault();
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("SecondaryClick", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                this.outcome.addOutcome({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.state = 'End';
                return true;
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                if (mouseEvent.button === 2) {
                    // Right button released - wait for contextmenu event
                    return false;
                }
            }
        }

        // Touch long-press for secondary click
        if ("Start" === this.state) {
            if ("touchstart" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    gestureSourceEvent.preventDefault();
                    this.state = "MouseDown";
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    this.outcome.addOutcome({ type: "gestureEvent", gestureEvent: gestureEvent });
                    // TODO: Set up timer for long-press detection
                    return true;
                }
            }
        }
        if ("MouseDown" === this.state) {
            if ("touchmove" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const firstPoint = this.gestureEventChain!.ListPoints[0];
                    const distance = clientPos.distanceTo(firstPoint);
                    if (this.manager!.options.mouseDistanceThresholdToDrag < distance) {
                        // Touch moved too far - cancel
                        this.state = 'Inactive';
                        return false;
                    } else {
                        return false;
                    }
                }
            }
            if ("touchend" === gestureSourceEvent.eventType || "touchcancel" === gestureSourceEvent.eventType) {
                // Touch ended before long-press threshold - not a secondary click
                this.state = 'Inactive';
                return false;
            }
        }

        // Keyboard - Shift+F10 or Menu key
        if ("Start" === this.state) {
            if ("keydown" === gestureSourceEvent.eventType) {
                const keyboardEvent = gestureSourceEvent.$event as KeyboardEvent;
                if (keyboardEvent.key === 'ContextMenu' ||
                    (keyboardEvent.key === 'F10' && keyboardEvent.shiftKey)) {
                    this.state = "KeyDown";
                    gestureSourceEvent.preventDefault();
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, undefined);
                    const gestureEvent = createKeyboardBrimboriumGestureEvent("SecondaryClick", gestureSourceEvent);
                    this.outcome.addOutcome({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                }
            }
        }
        if ("KeyDown" === this.state) {
            if ("keyup" === gestureSourceEvent.eventType) {
                this.state = "End";
                gestureSourceEvent.preventDefault();
                return true;
            }
        }

        return false;
    }
}
