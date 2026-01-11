import { Injectable } from '@angular/core';
import { BrimboriumGestureStateMaschine } from './brimborium-gesture-state-maschine';
import { BrimboriumGestureDragEffect } from './brimborium-gesture-drag-effect';
import { BrimboriumGestureOptions } from './brimborium-gesture-options';
import {
  GestureSourceEventName,
  IBrimboriumGestureRoot,
  IBrimboriumGestureEventRegistery,
  IsInterestingOn,
  IBrimboriumGestureManager,
  BrimboriumGestureName,
  SourceArrayValue,
  IBrimboriumGestureEffect
} from './brimborium-gesture-consts';
import type { BrimboriumGestureSourceEvent } from './brimborium-gesture-source-event';
import { BrimboriumGestureEvent } from './brimborium-gesture-event';

@Injectable({
  providedIn: 'root',
})
export class BrimboriumGestureManager implements IBrimboriumGestureManager {
  readonly stateMaschine: BrimboriumGestureStateMaschine;
  options: BrimboriumGestureOptions;

  constructor() {
    this.stateMaschine = new BrimboriumGestureStateMaschine(this);
    this.options = new BrimboriumGestureOptions();
  }

  setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery) {
    this.stateMaschine.setGestureEventRegistery(gestureEventRegistery);
  }

  isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn {
    return IsInterestingOn.Yes;
  }

  onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: BrimboriumGestureSourceEvent): void {
    this.stateMaschine.onGestureSourceEvent(gestureRoot, gestureEvent);
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

  processGestureEvent(gestureEvent: BrimboriumGestureEvent): void {
    // TODO: process gestureEvent -- handle state -- handle interaction    
  }
}
