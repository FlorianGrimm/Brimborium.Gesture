import { InjectionToken } from "@angular/core";
import type { BrimboriumGesture } from "./brimborium-gesture";
import type { BrimboriumGestureHandle } from "./brimborium-gesture-handle";
import type { BrimboriumGestureList } from "./brimborium-gesture-list";
import type { BrimboriumGestureRoot } from "./brimborium-gesture-root";

export const BrimboriumGestureInjectionToken = {
    BrimboriumGestureParent: new InjectionToken<BrimboriumGesture>('BrimboriumGestureParent'),
    BrimboriumGestureHandle: new InjectionToken<BrimboriumGestureHandle>('BrimboriumGestureHandle'),
    BrimboriumGestureList: new InjectionToken<BrimboriumGestureList>('BrimboriumGestureList'),
    BrimboriumGestureRoot: new InjectionToken<BrimboriumGestureRoot>('BrimboriumGestureRoot'),
};

//