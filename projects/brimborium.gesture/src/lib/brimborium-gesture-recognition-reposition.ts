import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import {
    createFaultBrimboriumGestureManager,
    type BrimboriumGestureRecognitionName,
    type IBrimboriumGestureManager,
    type IBrimboriumGestureRecognition
} from "./brimborium-gesture-consts";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { createMouseBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";

type BrimboriumGestureRecognitionRepositionState
    = 'Start'
    | 'MouseDown'
    | 'Repositioning'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "Reposition";

export class BrimboriumGestureRecognitionReposition extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionRepositionState> {
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
        // Reposition is similar to drag but typically for moving elements within a container
        // Mouse reposition
        if ("Start" === this.state) {
            if ("mousedown" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                if (mouseEvent.button === 0) { // Left mouse button
                    this.state = "MouseDown";
                    const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, clientPos);
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
                    // Mouse moved far enough - start repositioning
                    gestureSourceEvent.preventDefault();
                    this.state = 'Repositioning';
                    const gestureEvent = createMouseBrimboriumGestureEvent("DragStart", gestureSourceEvent, clientPos);
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                } else {
                    return false;
                }
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                // Released before threshold - not a reposition
                this.state = 'Inactive';
                return false;
            }
        }

        if ("Repositioning" === this.state) {
            if ("mousemove" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("DragMove", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                return true;
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("DragEnd", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.state = 'End';
                return true;
            }
        }

        // Touch reposition
        if ("Start" === this.state) {
            if ("touchstart" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    this.state = "MouseDown";
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, clientPos);
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
                        gestureSourceEvent.preventDefault();
                        this.state = 'Repositioning';
                        const gestureEvent = createMouseBrimboriumGestureEvent("DragStart", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            if ("touchend" === gestureSourceEvent.eventType || "touchcancel" === gestureSourceEvent.eventType) {
                this.state = 'Inactive';
                return false;
            }
        }

        if ("Repositioning" === this.state) {
            if ("touchmove" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.touches.length === 1) {
                    const touch = touchEvent.touches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const gestureEvent = createMouseBrimboriumGestureEvent("DragMove", gestureSourceEvent, clientPos);
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                }
            }
            if ("touchend" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                if (touchEvent.changedTouches.length === 1) {
                    const touch = touchEvent.changedTouches[0];
                    const clientPos = new Point2D(touch.clientX, touch.clientY);
                    const gestureEvent = createMouseBrimboriumGestureEvent("DragEnd", gestureSourceEvent, clientPos);
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                    this.state = 'End';
                    return true;
                }
            }
            if ("touchcancel" === gestureSourceEvent.eventType) {
                const touchEvent = gestureSourceEvent.$event as TouchEvent;
                const touch = touchEvent.changedTouches[0];
                const clientPos = new Point2D(touch.clientX, touch.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("DragCancel", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.state = 'End';
                return true;
            }
        }

        return false;
    }
}

