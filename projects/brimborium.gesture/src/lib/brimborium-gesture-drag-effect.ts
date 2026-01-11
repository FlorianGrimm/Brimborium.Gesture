import { IBrimboriumGestureEffect } from "./brimborium-gesture-consts";

/**
 * Effect for drag operations
 * Provides visual feedback during drag operations
 */
export class BrimboriumGestureDragEffect implements IBrimboriumGestureEffect {
    private element: HTMLElement | undefined;

    constructor(element?: HTMLElement) {
        this.element = element;
    }

    enter(): void {
        // Called when drag starts
        if (this.element) {
            this.element.classList.add('brimborium-dragging');
            this.element.style.cursor = 'grabbing';
            // Could add visual feedback like opacity change, shadow, etc.
        }
    }

    leave(): void {
        // Called when drag ends
        if (this.element) {
            this.element.classList.remove('brimborium-dragging');
            this.element.style.cursor = '';
        }
    }
}
