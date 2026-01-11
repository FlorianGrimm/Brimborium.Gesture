import { Injectable } from '@angular/core';
import type { BrimboriumGestureNodeRef } from './brimborium-gesture-node-ref';
import type { BrimboriumGestureRoot } from './brimborium-gesture-root';
import { BrimboriumGestureSourceEvent, GestureSourceEventName, IBrimboriumGestureRoot, IBrimboriumGestureEventRegistery, IsInterestingOn, IBrimboriumGestureManager, BrimboriumGestureName, SourceArrayValue, IBrimboriumGestureEffect } from './brimborium-gesture-consts';
import { BrimboriumGestureStateMaschine } from './brimborium-gesture-state-maschine';
import { BrimboriumGestureEventRegistery } from './brimborium-gesture-event-registery';
import { BrimboriumGestureDragEffect } from './brimborium-gesture-drag-effect';

@Injectable({
  providedIn: 'root',
})
export class BrimboriumGestureManager implements IBrimboriumGestureManager {
  readonly stateMaschine: BrimboriumGestureStateMaschine;

  constructor() {
    this.stateMaschine = new BrimboriumGestureStateMaschine();
  }

  setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery) {
    this.stateMaschine.setGestureEventRegistery(gestureEventRegistery);
  }

  isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn {
    return IsInterestingOn.Yes;
  }

  onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: BrimboriumGestureSourceEvent): void {
    this.stateMaschine.onGestureEvent(gestureRoot, gestureEvent);
  }

  eventPreventDefault($event: Event): void {
    $event.preventDefault();
  }

  getGestureAllowed(): SourceArrayValue<BrimboriumGestureName> | undefined {
    return undefined;
  }

  createDragEffect(): IBrimboriumGestureEffect {
    return new BrimboriumGestureDragEffect();
  }
}
