import { NgModule, Provider } from "@angular/core";
import { BrimboriumGestureManager } from "./brimborium-gesture-manager";
import { BrimboriumGesture } from "./brimborium-gesture";
import { BrimboriumGestureHandle } from "./brimborium-gesture-handle";
import { BrimboriumGestureRoot } from "./brimborium-gesture-root";
import { BrimboriumGestureList } from "./brimborium-gesture-list";

@NgModule({
    providers:[
        BrimboriumGestureManager,
    ],
    imports:[
        BrimboriumGesture,
        BrimboriumGestureHandle,
        BrimboriumGestureList,
        BrimboriumGestureRoot
    ],
    exports:[
        BrimboriumGesture,
        BrimboriumGestureHandle,
        BrimboriumGestureList,
        BrimboriumGestureRoot
    ]
})
export class BrimboriumGestureModule {
}