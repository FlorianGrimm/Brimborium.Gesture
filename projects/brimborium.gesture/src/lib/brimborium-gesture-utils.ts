import { BrimboriumGestureTypeName, BrimboriumInteractionTypeName, IBrimboriumGestureManager, SourceArrayValue } from "./brimborium-gesture-consts";
import { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import { BrimboriumGestureOptions } from "./brimborium-gesture-options";

class FaultBrimboriumGestureManager implements IBrimboriumGestureManager {
    public getGestureEnabled(): Set<BrimboriumGestureTypeName> { throw new Error("Not Allowed."); }
    public setGestureEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean { throw new Error("Not Allowed."); }
    public getInteractionEnabled(): Set<BrimboriumInteractionTypeName> { throw new Error("Not Allowed."); }
    public setInteractionEnabled(name: BrimboriumInteractionTypeName, isEnabled: boolean): boolean { throw new Error("Not Allowed."); }
    public calcGestureEnabled(interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined, gestureEnabled: SourceArrayValue<BrimboriumGestureTypeName> | undefined): Set<BrimboriumGestureTypeName> | undefined { throw new Error("Not Allowed."); }
    public getGestureAllowed(): SourceArrayValue<BrimboriumGestureTypeName> | undefined { throw new Error("Not Allowed."); }
    public getInteractionAllowed(): SourceArrayValue<BrimboriumInteractionTypeName> | undefined { throw new Error("Not Allowed."); }
    public get options(): BrimboriumGestureOptions { throw new Error("Not Allowed."); }
    public set options(value: BrimboriumGestureOptions) { throw new Error("Not Allowed."); }
    public eventPreventDefault($event: Event): void { throw new Error("Not Allowed."); }
    public processGestureEvent(gestureEvent: BrimboriumGestureEvent): void { throw new Error("Not Allowed."); }
}
const faultBrimboriumGestureManager = new FaultBrimboriumGestureManager();
export function createFaultBrimboriumGestureManager(): IBrimboriumGestureManager { return faultBrimboriumGestureManager; }
