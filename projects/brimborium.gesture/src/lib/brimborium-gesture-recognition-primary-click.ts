import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { createFaultBrimboriumGestureManager, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager } from "./brimborium-gesture-consts";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { BrimboriumGestureEvent, createKeyboardBrimboriumGestureEvent, createMouseBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";

type BrimboriumGestureRecognitionPrimaryClickState
    = 'Start'
    | 'MouseDown'
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
            { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
        ];
        this.needUpdateListEventRegister = true;
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
                    // ignore
                    return false;
                } else {
                    this.state = 'Inactive';
                    return false;
                }
            }
            if ("mouseup" === gestureSourceEvent.eventType) {
                const mouseEvent = gestureSourceEvent.$event as MouseEvent;
                const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
                const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent, clientPos);
                this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                (this.listOutcome ??= []).push({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.state = 'End';
                return true;
            }
        }
        // touch

        // keyboard Space 
        if ("Start" === this.state) {
            if ("keydown" === gestureSourceEvent.eventType) {
                const keyboardEvent = gestureSourceEvent.$event as KeyboardEvent;
                if (' ' === keyboardEvent.key) {
                    this.state = "KeyDown";
                    gestureSourceEvent.preventDefault();
                    this.gestureEventChain!.appendEvent(gestureSourceEvent, undefined);
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
