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

type BrimboriumGestureRecognitionDragNDropState
    = 'Start'
    | 'MouseDown'
    | 'Dragging'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "DragNDrop";

export class BrimboriumGestureRecognitionDragNDrop extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionDragNDropState> {
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
        // Mouse drag
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
                    // Mouse moved far enough - start dragging
                    gestureSourceEvent.preventDefault();
                    this.state = 'Dragging';
                    const gestureEvent = createMouseBrimboriumGestureEvent("DragStart", gestureSourceEvent, clientPos);
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                    (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                    return true;
                } else {
                    // Still within threshold
                    return false;
                }
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                // Released before drag threshold - not a drag
                this.state = 'Inactive';
                return false;
            }
        }

        if ("Dragging" === this.state) {
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

        // Touch drag
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
                        // Touch moved far enough - start dragging
                        gestureSourceEvent.preventDefault();
                        this.state = 'Dragging';
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
                // Released before drag threshold - not a drag
                this.state = 'Inactive';
                return false;
            }
        }

        if ("Dragging" === this.state) {
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

