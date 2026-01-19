import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import {
    type BrimboriumGestureRecognitionName,
    type IBrimboriumGestureManager
} from "./brimborium-gesture-consts";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { createFaultBrimboriumGestureManager } from "./brimborium-gesture-utils";
import { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";

type BrimboriumGestureRecognitionContextMenuState
    = 'Start'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "ContextMenu";

export class BrimboriumGestureRecognitionContextMenu extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionContextMenuState> {
    manager: IBrimboriumGestureManager = createFaultBrimboriumGestureManager();

    constructor() {
        super(gestureRecognitionName, "Start");
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
            // { gestureRecognition: gestureRecognitionName, eventType: "contextmenu", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
        ];
        this.needUpdateListEventRegister = true;
    }


    override processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        const isEnabledReposition = gestureSourceEvent.getGestureEnabled()?.has('Reposition');
        if (!isEnabledReposition) { return false; }
        return false;
    }
}

