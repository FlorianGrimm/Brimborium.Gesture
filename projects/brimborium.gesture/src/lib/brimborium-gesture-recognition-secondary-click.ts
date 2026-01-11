import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import {
    createFaultBrimboriumGestureManager,
    type BrimboriumGestureRecognitionName,
    type IBrimboriumGestureManager
} from "./brimborium-gesture-consts";
import type { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";

type BrimboriumGestureRecognitionSecondaryClickState
    = 'Start'
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
            { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
        ];
        this.needUpdateListEventRegister = true;
    }
}
