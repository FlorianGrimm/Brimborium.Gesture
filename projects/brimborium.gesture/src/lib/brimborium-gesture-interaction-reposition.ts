import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { Point2D } from "./point2d";
import type { IBrimboriumGestureInteraction } from "./brimborium-gesture-consts";

type BrimboriumGestureInteractionRepositionState
    = 'Start'
    | 'Dragging'
    | 'End'
    ;

export class BrimboriumGestureInteractionReposition extends BrimboriumGestureInteraction<BrimboriumGestureInteractionRepositionState> {
    private startPos: Point2D | undefined;
    private currentPos: Point2D | undefined;
    private targetElement: HTMLElement | undefined;

    constructor(){
        super("Reposition", "Start")
    }

    override processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean {
        if (gestureEvent.eventType === "DragStart") {
            this.state = "Dragging";
            this.startPos = gestureEvent.clientPos;
            this.currentPos = gestureEvent.clientPos;

            // Get the target element
            if (gestureEvent.target instanceof HTMLElement) {
                this.targetElement = gestureEvent.target;
                // Store initial position if needed
            }
            return true;
        }

        if (this.state === "Dragging") {
            if (gestureEvent.eventType === "DragMove") {
                if (this.startPos && gestureEvent.clientPos && this.targetElement) {
                    this.currentPos = gestureEvent.clientPos;

                    // Calculate delta from start position
                    const deltaX = this.currentPos.x - this.startPos.x;
                    const deltaY = this.currentPos.y - this.startPos.y;

                    // Update element position
                    // This assumes the element has position: absolute or similar
                    this.targetElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                }
                return true;
            }

            if (gestureEvent.eventType === "DragEnd") {
                this.state = "End";
                // Finalize position
                if (this.startPos && this.currentPos && this.targetElement) {
                    const deltaX = this.currentPos.x - this.startPos.x;
                    const deltaY = this.currentPos.y - this.startPos.y;

                    // Apply final position
                    this.targetElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                }
                return true;
            }

            if (gestureEvent.eventType === "DragCancel") {
                this.state = "End";
                // Reset position
                if (this.targetElement) {
                    this.targetElement.style.transform = '';
                }
                return true;
            }
        }

        return false;
    }

    override reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        this.state = "Start";
        this.startPos = undefined;
        this.currentPos = undefined;
        this.targetElement = undefined;
    }
}
