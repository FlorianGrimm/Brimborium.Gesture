import { InjectionToken } from "@angular/core";
import type { BrimboriumGesture } from "./brimborium-gesture";
import type { BrimboriumGestureHandle } from "./brimborium-gesture-handle";
import type { BrimboriumGestureList } from "./brimborium-gesture-list";
import type { BrimboriumGestureRoot } from "./brimborium-gesture-root";
import type { IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";

export const BrimboriumGestureInjectionToken = {
    BrimboriumGestureParent: new InjectionToken<BrimboriumGesture>('BrimboriumGestureParent'),
    BrimboriumGestureHandle: new InjectionToken<BrimboriumGestureHandle>('BrimboriumGestureHandle'),
    BrimboriumGestureList: new InjectionToken<BrimboriumGestureList>('BrimboriumGestureList'),
    BrimboriumGestureRoot: new InjectionToken<BrimboriumGestureRoot>('BrimboriumGestureRoot'),

    BrimboriumGestureRecognitionPrimaryClick: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureRecognitionPrimaryClick'),
    BrimboriumGestureRecognitionSecondaryClick: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureRecognitionSecondaryClick'),
    BrimboriumGestureRecognitionContextMenu: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureRecognitionContextMenu'),
    BrimboriumGestureRecognitionDragNDrop: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureRecognitionDragNDrop'),
    BrimboriumGestureRecognitionReposition: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureRecognitionReposition'),
    
    BrimboriumGestureInteractionPrimaryClick: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureInteractionPrimaryClick'),
    BrimboriumGestureInteractionSecondaryClick: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureInteractionSecondaryClick'),
    BrimboriumGestureInteractionContextMenu: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureInteractionContextMenu'),
    BrimboriumGestureInteractionDragNDrop: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureInteractionDragNDrop'),
    BrimboriumGestureInteractionReposition: new InjectionToken<IBrimboriumGestureInteraction>('BrimboriumGestureInteractionReposition'),
};

//