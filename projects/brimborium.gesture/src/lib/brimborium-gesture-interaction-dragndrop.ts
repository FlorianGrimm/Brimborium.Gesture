import { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { Point2D } from "./point2d";
import type { BrimboriumGestureTypeName, IBrimboriumInteractionEffect, BrimboriumInteractionTypeName, BrimboriumQueryInteractionEffect, IBrimboriumGestureInteraction, IBrimboriumGestureManager, IBrimboriumGestureRecognition } from "./brimborium-gesture-consts";
import { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";

type BrimboriumGestureInteractionDragNDropState
    = 'Start'
    | 'Dragging'
    | 'End'
    ;

export class BrimboriumGestureInteractionDragNDrop extends BrimboriumGestureInteraction<BrimboriumGestureInteractionDragNDropState> {
    private startPos: Point2D | undefined;
    private currentPos: Point2D | undefined;
    private draggedElement: HTMLElement | undefined;
    private dropTarget: HTMLElement | undefined;
    interactionEffect: IBrimboriumInteractionEffect | null=null;

    constructor(manager:IBrimboriumGestureManager) {
        super("DragNDrop", "Start", manager)
    }

    override getListSupportedInteractionName(): readonly BrimboriumInteractionTypeName[] {
        return ['DragNDrop'] as const;
    }

    override getListNeededGesture(interactionName: BrimboriumInteractionTypeName): readonly BrimboriumGestureTypeName[] {
        return ['DragNDrop'] as const;
    }

    override processGestureEvent(gestureEvent: BrimboriumGestureEvent): boolean {
        const eventType = gestureEvent.eventType;
        console.log("DragNDrop begin", {state:this.state,eventType:eventType});
        if (eventType === "DragStart") {
            this.startPos = gestureEvent.clientPos;
            this.currentPos = gestureEvent.clientPos;
            const eventQuery:BrimboriumQueryInteractionEffect={
                eventType: "DragStart",
                interactionEffect:null,
                nodeRef: gestureEvent.nodeRef
            };
            
            this.manager.hanedleQueryInteractionEffect(eventQuery);
            let interactionEffect: null|IBrimboriumInteractionEffect=eventQuery.interactionEffect;
            if (eventQuery.interactionEffect==null){
                interactionEffect=new BrimboriumGestureInteractionDragNDropEffect();
            }            
            this.state = "Dragging";
            this.interactionEffect=interactionEffect;

            // Get the dragged element
            if (gestureEvent.target instanceof HTMLElement) {
                this.draggedElement = gestureEvent.target;
                // Add dragging class or visual feedback
                this.draggedElement.classList.add('dragging');
            }
            console.log("DragNDrop-set", {state:this.state});
            return true;
        }

        if (this.state === "Dragging") {
            if (eventType === "DragMove") {
                if (this.startPos && gestureEvent.clientPos && this.draggedElement) {
                    this.currentPos = gestureEvent.clientPos;

                    // Calculate delta from start position
                    const deltaX = this.currentPos.x - this.startPos.x;
                    const deltaY = this.currentPos.y - this.startPos.y;

                    // Update element position during drag
                    this.draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                    // Check for drop targets under cursor
                    // This is a simplified version - real implementation would need more logic
                    const elementAtPoint = document.elementFromPoint(this.currentPos.x, this.currentPos.y);
                    if (elementAtPoint instanceof HTMLElement && elementAtPoint.classList.contains('drop-target')) {
                        this.dropTarget = elementAtPoint;
                        this.dropTarget.classList.add('drop-hover');
                    } else if (this.dropTarget) {
                        this.dropTarget.classList.remove('drop-hover');
                        this.dropTarget = undefined;
                    }
                }
                return true;
            }

            if (eventType === "DragEnd") {
                this.state = "End";

                if (this.draggedElement) {
                    this.draggedElement.classList.remove('dragging');

                    // Check if dropped on valid target
                    if (this.dropTarget) {
                        // Perform drop operation
                        this.dropTarget.classList.remove('drop-hover');
                        // Here you would typically move the element to the drop target
                        // or trigger a custom drop event

                        // Reset transform
                        this.draggedElement.style.transform = '';
                    } else {
                        // No valid drop target - animate back to original position
                        this.draggedElement.style.transform = '';
                    }
                }

                console.log("DragNDrop-set", {state:this.state});

                return true;
            }

            if (eventType === "DragCancel") {
                this.state = "End";

                // Cancel drag - reset everything
                if (this.draggedElement) {
                    this.draggedElement.classList.remove('dragging');
                    this.draggedElement.style.transform = '';
                }
                if (this.dropTarget) {
                    this.dropTarget.classList.remove('drop-hover');
                }

                console.log("DragNDrop-set", {state:this.state});

                return true;
            }
        }

        return false;
    }

    override reset(finished: undefined | (IBrimboriumGestureInteraction<string>[])): void {
        super.reset(finished);
        this.state = "Start";
        this.startPos = undefined;
        this.currentPos = undefined;
        this.draggedElement = undefined;
        this.dropTarget = undefined;
    }
}

/*

export class BrimboriumGestureInteractionEffectDragNDrop implements IBrimboriumInteractionEffect{}
export class BrimboriumGestureInteractionEffectReposition implements IBrimboriumInteractionEffect{}
export class BrimboriumGestureInteractionEffectContextMenu implements IBrimboriumInteractionEffect{}


ng g class BrimboriumGestureInteractionEffectDragNDrop --project Brimborium.Gesture
ng g class BrimboriumGestureInteractionEffectReposition --project Brimborium.Gesture
ng g class BrimboriumGestureInteractionEffectContextMenu --project Brimborium.Gesture

*/