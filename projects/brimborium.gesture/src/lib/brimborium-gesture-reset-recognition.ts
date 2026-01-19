import {
    type IBrimboriumGestureEffect,
    type IBrimboriumGestureManager
} from "./brimborium-gesture-consts";
import {
    type BrimboriumGestureRecognition
} from "./brimborium-gesture-recognition";

export class BrimboriumGestureResetRecognition implements IBrimboriumGestureEffect {
    constructor(
        public brimboriumGestureRecognition: BrimboriumGestureRecognition<any>,
        public manager: IBrimboriumGestureManager
    ) {
    }
    enter(): void {
        this.brimboriumGestureRecognition.state = "Start";
        this.manager.resetGestureRecognition(this.brimboriumGestureRecognition);
    }
    leave(): void {
    }
}
