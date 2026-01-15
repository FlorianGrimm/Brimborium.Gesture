import { inject, Injectable } from '@angular/core';
import { BrimboriumGestureStateMaschine } from './brimborium-gesture-state-maschine';
import { BrimboriumGestureDragEffect } from './brimborium-gesture-drag-effect';
import { BrimboriumGestureOptions } from './brimborium-gesture-options';
import {
  GestureSourceEventName,
  IBrimboriumGestureRoot,
  IBrimboriumGestureEventRegistery,
  IsInterestingOn,
  IBrimboriumGestureManager,
  BrimboriumGestureTypeName,
  SourceArrayValue,
  IBrimboriumGestureEffect,
  BrimboriumInteractionTypeName
} from './brimborium-gesture-consts';
import type { BrimboriumGestureSourceEvent } from './brimborium-gesture-source-event';
import { BrimboriumGestureEvent } from './brimborium-gesture-event';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import { BrimboriumGestureRecognitionPrimaryClick } from './brimborium-gesture-recognition-primary-click';
import { BrimboriumGestureRecognitionSecondaryClick } from './brimborium-gesture-recognition-secondary-click';
import { BrimboriumGestureRecognitionContextMenu } from './brimborium-gesture-recognition-context-menu';
import { BrimboriumGestureRecognitionDragNDrop } from './brimborium-gesture-recognition-drag-n-drop';
import { BrimboriumGestureRecognitionReposition } from './brimborium-gesture-recognition-reposition';
import { BrimboriumGestureInteractionPrimaryClick } from './brimborium-gesture-interaction-primary-click';
import { BrimboriumGestureInteractionSecondaryClick } from './brimborium-gesture-interaction-secondary-click';
import { BrimboriumGestureInteractionContextMenu } from './brimborium-gesture-interaction-context-menu';
import { BrimboriumGestureInteractionDragNDrop } from './brimborium-gesture-interaction-dragndrop';
import { BrimboriumGestureInteractionReposition } from './brimborium-gesture-interaction-reposition';

@Injectable({
  providedIn: 'root'
})
export class BrimboriumGestureManager implements IBrimboriumGestureManager {
  readonly stateMaschine: BrimboriumGestureStateMaschine;
  readonly options: BrimboriumGestureOptions;

  constructor() {
    this.stateMaschine = new BrimboriumGestureStateMaschine(this);
    this.options = new BrimboriumGestureOptions();
    this.stateMaschine.registerRecognition(new BrimboriumGestureRecognitionPrimaryClick());
    this.stateMaschine.registerRecognition(new BrimboriumGestureRecognitionSecondaryClick());
    this.stateMaschine.registerRecognition(new BrimboriumGestureRecognitionContextMenu());
    this.stateMaschine.registerRecognition(new BrimboriumGestureRecognitionDragNDrop());
    this.stateMaschine.registerRecognition(new BrimboriumGestureRecognitionReposition());
    this.stateMaschine.registerInteraction(new BrimboriumGestureInteractionPrimaryClick());
    this.stateMaschine.registerInteraction(new BrimboriumGestureInteractionSecondaryClick());
    this.stateMaschine.registerInteraction(new BrimboriumGestureInteractionContextMenu());
    this.stateMaschine.registerInteraction(new BrimboriumGestureInteractionDragNDrop());
    this.stateMaschine.registerInteraction(new BrimboriumGestureInteractionReposition());
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

  /* TODO: later
  readonly gestureAllowed = new Set<BrimboriumGestureName>();
  getGestureAllowed(): Set<BrimboriumGestureName>{
    return this.gestureAllowed;
  }

  readonly interactionAllowed = new Set<BrimboriumGestureName>();
  getInteractionAllowed(): Set<BrimboriumInteractionName> {
    return this.interactionAllowed;
  }
  
  */
 getListRecognitionTypeName(){  return this.stateMaschine.getListRecognitionTypeName(); }
 getListInteractionTypeName(){  return this.stateMaschine.getListInteractionTypeName(); }

  readonly gestureEnabled = new Set<BrimboriumGestureTypeName>();
  getGestureEnabled(): Set<BrimboriumGestureTypeName> {
    return this.gestureEnabled;
  }
  setGestureEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean {
    const current = this.gestureEnabled.has(name);
    if (current === isEnabled) {
      return false;
    } else {
      if (isEnabled) {
        this.gestureEnabled.add(name);
      } else {
        this.gestureEnabled.delete(name);
      }
      return true;
    }
  }

  readonly interactionEnabled = new Set<BrimboriumGestureTypeName>();
  getInteractionEnabled(): Set<BrimboriumInteractionTypeName> {
    return this.interactionEnabled;
  }
  setInteractionEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean {
    const current = this.interactionEnabled.has(name);
    if (current === isEnabled) {
      return false;
    } else {
      if (isEnabled) {
        this.interactionEnabled.add(name);
      } else {
        this.interactionEnabled.delete(name);
      }
      return true;
    }
  }

  calcGestureEnabled(
    interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined,
    gestureEnabled: SourceArrayValue<BrimboriumGestureTypeName> | undefined
  ): Set<BrimboriumGestureTypeName> | undefined {
    return this.stateMaschine.calcGestureEnabled(interactionEnabled, gestureEnabled);
  }

  createDragEffect(): IBrimboriumGestureEffect {
    return new BrimboriumGestureDragEffect();
  }

  processGestureEvent(gestureEvent: BrimboriumGestureEvent): void {
    // TODO: process gestureEvent -- handle state -- handle interaction    
  }
}
