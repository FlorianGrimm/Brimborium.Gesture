
import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
import { BrimboriumGestureTypeName, type BrimboriumGestureRecognitionName, type IBrimboriumGestureManager, type IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import { BrimboriumGestureSourceEventChain, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";
import { createMouseBrimboriumGestureEvent } from "./brimborium-gesture-event";
import { Point2D } from "./point2d";
import { Injectable } from "@angular/core";
import type { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { BrimboriumGestureResetRecognition } from "./brimborium-gesture-reset-recognition";

type BrimboriumGestureRecognitionMouseState
    = 'Start'
    | 'MouseDown'
    | 'Dragging'
    | 'TouchDown'
    | 'KeyDown'
    | 'Inactive'
    | 'End'
    ;

const gestureRecognitionName: BrimboriumGestureRecognitionName = "Mouse";

/*
'PrimaryClick' =  MouseDown(Primary) + MouseUp(Primary)
'PrimaryLongClick' = MouseDown(Primary) + MouseUp(Primary && after a long timestamp difference)
'SecondaryClick' =  MouseDown(Secondary) + MouseUp(Secondary)
'SecondaryLongClick' = MouseDown(Secondary) + MouseUp(Secondary && after a long timestamp difference)
'DragNDrop' = MouseDown(Primary) + MouseMove(Primary && distance)-> DragStart + MouseMove(Primary) -> DragMove  + MouseUp(Primary) -> DragEnd
Need to clarify why to choose which Keyboard Shift Ctrl Alt
'Reposition' = MouseDown(Primary) + MouseMove(Primary && distance)-> DragStart + MouseMove(Primary) -> DragMove  + MouseUp(Primary) -> DragEnd
'Resize' = MouseDown(Primary) + MouseMove(Primary && distance)-> DragStart + MouseMove(Primary) -> DragMove  + MouseUp(Primary) -> DragEnd
'Pan' MouseDown(Primary) + MouseMove(Primary && distance) + MouseUp(Primary)
'Swipe' MouseDown(Primary) + MouseMove(Primary && distance) + MouseUp(Primary)
'Pinch' MouseDown(Primary) + MouseMove(Primary && distance) + MouseUp(Primary)
'Rotate' MouseDown(Primary) + MouseMove(Primary && distance) + MouseUp(Primary)
*/

export class BrimboriumGestureRecognitionMouse extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionMouseState> {
    manager: IBrimboriumGestureManager;

    constructor(manager: IBrimboriumGestureManager) {
        super(gestureRecognitionName, "Start");
        this.manager = manager;
    }

    override getListSupportedGestureName(): BrimboriumGestureTypeName[] {
        return [
            'PrimaryClick',
            'PrimaryLongClick',
            'SecondaryClick',
            'SecondaryLongClick',
            'DragNDrop',
            'Reposition',
            'Resize',
            'Pan',
            'Swipe',
            'Pinch',
            'Rotate'
        ];
    }

    override initialize(
        manager: IBrimboriumGestureManager,
        outcome: BrimboriumGestureRecognitionOutcome
    ): void {
        this.manager = manager;
        this.outcome = outcome;
        this.ListEventRegister = [
            { gestureRecognition: gestureRecognitionName, eventType: "mousedown", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mousemove", active: true },
            { gestureRecognition: gestureRecognitionName, eventType: "mouseup", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "keydown", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "keyup", active: true },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchstart", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchmove", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchend", active: false },
            // { gestureRecognition: gestureRecognitionName, eventType: "touchcancel", active: false },
        ];
        this.needUpdateListEventRegister = true;
    }

    override resetRecognition(
        finished: undefined | (IBrimboriumGestureRecognition<string>)
    ): void {
        super.resetRecognition(finished);
        this.state = "Start";
    }

    handlerTimeout: number = 0;

    override processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
        const isEnabledPrimaryClick = gestureSourceEvent.getGestureEnabled()?.has('PrimaryClick');
        const isEnabledPrimaryLongClick = gestureSourceEvent.getGestureEnabled()?.has('PrimaryLongClick');

        const isEnabledSecondaryClick = gestureSourceEvent.getGestureEnabled()?.has('SecondaryClick');
        const isEnabledSecondaryLongClick = gestureSourceEvent.getGestureEnabled()?.has('SecondaryLongClick');

        const isEnabledDragNDrop = gestureSourceEvent.getGestureEnabled()?.has('DragNDrop');
        const isEnabledReposition = gestureSourceEvent.getGestureEnabled()?.has('Reposition');
        const isEnabledResize = gestureSourceEvent.getGestureEnabled()?.has('Resize');
        const isEnabledPan = gestureSourceEvent.getGestureEnabled()?.has('Pan');
        const isEnabledSwipe = gestureSourceEvent.getGestureEnabled()?.has('Swipe');
        const isEnabledPinch = gestureSourceEvent.getGestureEnabled()?.has('Pinch');
        const isEnabledRotate = gestureSourceEvent.getGestureEnabled()?.has('Rotate');

        const extraInfo = getExtraInfo(gestureSourceEvent);
        if (extraInfo == null){return false;}
        const eventType = gestureSourceEvent.eventType;

        if ("Start" === this.state){
            if ("mousedown" === eventType){
                // Check if primary or secondary button is pressed
                if (extraInfo.primary && (isEnabledPrimaryClick || isEnabledPrimaryLongClick || isEnabledDragNDrop)) {
                    const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, extraInfo.clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    this.outcome?.add({type:"gestureEvent", gestureEvent: gestureEvent});
                    this.state = "MouseDown";
                    return true;
                } else if (extraInfo.secondary && (isEnabledSecondaryClick || isEnabledSecondaryLongClick)) {
                    const gestureEvent = createMouseBrimboriumGestureEvent("MouseDown", gestureSourceEvent, extraInfo.clientPos);
                    this.gestureEventChain = new BrimboriumGestureSourceEventChain(gestureSourceEvent, gestureEvent.clientPos);
                    this.outcome?.add({type:"gestureEvent", gestureEvent: gestureEvent});
                    this.state = "MouseDown";
                    return true;
                }
                return false;
            }
            if ("mouseup" === eventType) {
                //
                return false;
            }
            if ("mousemove" === eventType){
                return false;
            }
            if ("mouseenter" === eventType){
                return false;
            }
            if ("mouseover" === eventType){
                return false;
            }
            if ("mouseleave" === eventType){
                return false;
            }
        }
        if ("MouseDown" === this.state){
            if ("mousedown" === eventType){
                // mousedown within MouseDown is unexpected
                this.resetRecognition(undefined);
                return false;
            }
            if ("mouseup" === eventType){
                const clientPos = extraInfo.clientPos;
                const diffTimeStamp = gestureSourceEvent.timeStamp - this.gestureEventChain!.initialEvent.timeStamp;

                // Determine if this was a primary or secondary button release
                // Note: On mouseup, the button that was released is no longer in the buttons bitmask
                // We need to check which button was initially pressed in the MouseDown event
                const initialMouseEvent = this.gestureEventChain!.initialEvent.$event as MouseEvent;
                const wasPrimaryButton = (initialMouseEvent.buttons & 1) !== 0;
                const wasSecondaryButton = (initialMouseEvent.buttons & 2) !== 0;

                if (diffTimeStamp < this.manager!.options.longClickThreshold) {
                    // Short click
                    if (wasPrimaryButton && isEnabledPrimaryClick) {
                        const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                        this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) });
                        this.state = 'End';
                        return true;
                    } else if (wasSecondaryButton && isEnabledSecondaryClick) {
                        const gestureEvent = createMouseBrimboriumGestureEvent("SecondaryClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                        this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) });
                        this.state = 'End';
                        return true;
                    }
                } else {
                    // Long click
                    if (wasPrimaryButton && isEnabledPrimaryLongClick) {
                        const gestureEvent = createMouseBrimboriumGestureEvent("PrimaryLongClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                        this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) });
                        this.state = 'End';
                        return true;
                    } else if (wasSecondaryButton && isEnabledSecondaryLongClick) {
                        const gestureEvent = createMouseBrimboriumGestureEvent("SecondaryLongClick", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                        this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) });
                        this.state = 'End';
                        return true;
                    }
                }

                // If we get here, the gesture wasn't enabled or didn't match
                this.resetRecognition(undefined);
                return false;
            }
            if ("mousemove" === eventType){
                // Check if DragNDrop is enabled and if we've moved far enough to start dragging
                if (isEnabledDragNDrop && extraInfo.primary) {
                    const clientPos = extraInfo.clientPos;
                    const initialPos = this.gestureEventChain!.ListPoints[0];
                    const distance = initialPos.distanceTo(clientPos);

                    if (this.manager!.options.mouseDistanceThresholdToDrag < distance) {
                        // Mouse moved far enough - start dragging
                        gestureSourceEvent.preventDefault();
                        this.state = 'Dragging';
                        const gestureEvent = createMouseBrimboriumGestureEvent("DragStart", gestureSourceEvent, clientPos);
                        this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                        this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                        return true;
                    } else {
                        // Still within threshold - don't reset, just wait
                        return false;
                    }
                }
                // If DragNDrop is not enabled, reset
                this.resetRecognition(undefined);
                return false;
            }
            if ("mouseenter" === eventType){
                this.resetRecognition(undefined);
                return false;
            }
            if ("mouseover" === eventType){
                this.resetRecognition(undefined);
                return false;
            }
            if ("mouseleave" === eventType){
                this.resetRecognition(undefined);
                return false;
            }

        }

        if ("Dragging" === this.state){
            if ("mousemove" === eventType){
                // Continue dragging
                const clientPos = extraInfo.clientPos;
                const gestureEvent = createMouseBrimboriumGestureEvent("DragMove", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                return true;
            }
            if ("mouseup" === eventType){
                // End dragging
                const clientPos = extraInfo.clientPos;
                const gestureEvent = createMouseBrimboriumGestureEvent("DragEnd", gestureSourceEvent, clientPos);
                this.gestureEventChain!.appendEvent(gestureSourceEvent, clientPos);
                this.outcome?.add({ type: "gestureEvent", gestureEvent: gestureEvent });
                this.outcome?.add({ type: "gestureEffect", effect: new BrimboriumGestureResetRecognition(this, this.manager) });
                this.state = 'End';
                return true;
            }
            if ("mousedown" === eventType){
                // Unexpected mousedown during drag - reset
                this.resetRecognition(undefined);
                return false;
            }
            if ("mouseenter" === eventType){
                // Can continue dragging when entering elements
                return false;
            }
            if ("mouseover" === eventType){
                // Can continue dragging when over elements
                return false;
            }
            if ("mouseleave" === eventType){
                // Can continue dragging when leaving elements
                return false;
            }
        }

        return false;
    }
}
function getExtraInfo(gestureSourceEvent: BrimboriumGestureSourceEvent) {
    const eventType = gestureSourceEvent.eventType;
    if (("mousedown" === eventType)
        || ("mouseup" === eventType)
        || ("mousemove" === eventType)
        || ("mouseenter" === eventType)
        || ("mouseover" === eventType)
        || ("mouseleave" === eventType)
    ) {
        const mouseEvent = gestureSourceEvent.$event as MouseEvent;
        const clientPos = new Point2D(mouseEvent.clientX, mouseEvent.clientY);
        const buttons = mouseEvent.buttons;
        return ({
            clientPos: clientPos,
            shiftKey: mouseEvent.shiftKey,
            ctrlKey: mouseEvent.ctrlKey,
            altKey: mouseEvent.altKey,
            primary: ((buttons & 1) != 0),
            secondary: ((buttons & 2) != 0),
            auxiliary: ((buttons & 4) != 0),
        });
    }
    return undefined;
}