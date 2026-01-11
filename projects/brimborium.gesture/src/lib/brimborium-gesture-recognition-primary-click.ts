import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { createFaultBrimboriumGestureManager, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager, type IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent, createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";

type BrimboriumGestureRecognitionPrimaryClickState
    = 'Start'
    | 'MouseDown'
    | 'TouchDown'
    | 'KeyDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "PrimaryClick";
/**
 * 
 */
export class BrimboriumGestureRecognitionPrimaryClick extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionPrimaryClickState> {
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
            { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "keyup", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: true },
        ];
        this.needUpdateListEventRegister = true;
    }

    override reset(finished: undefined | (IBrimboriumGestureRecognition<string>[])): void {
        super.reset(finished);
        this.state = "Start";
        this.listOutcome = undefined;
    }

    override process(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        if ("Start" === this.state) {
            if ("mousedown" === gestureSourceEvent.eventType) {
                gestureSourceEvent.preventDefault();

                this.state = "MouseDown";
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, clientPos);
                this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
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
                const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent, clientPos);
                // Append to existing chain instead of overwriting
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.state = 'End';
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
                    const gestureEvent = createMouseBrimboriumGestureEvent("TouchDown", gestureSourceEvent, clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
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
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                    this.state = 'End';
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
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
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
        return false
    }
}
