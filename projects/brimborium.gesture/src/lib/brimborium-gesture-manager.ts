import { EventEmitter, Injectable } from '@angular/core';
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
  BrimboriumInteractionTypeName,
  IBrimboriumGestureInteraction,
  IBrimboriumGestureRecognition,
  ItemBrimboriumGestureInteractionOutcome,
  ItemBrimboriumGestureRecognitionOutcome
} from './brimborium-gesture-consts';
import { sourceArrayValueAsIteratorLike, type BrimboriumGestureSourceEvent } from './brimborium-gesture-source-event';
import { BrimboriumGestureEvent } from './brimborium-gesture-event';
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
import { BrimboriumGestureRecognitionOutcome } from './brimborium-gesture-recognition-outcome';
import { GestureEventRegister } from './brimborium-gesture-event-registery';
import { BrimboriumGestureInteractionOutcome } from './brimborium-gesture-interaction-outcome';
import { BrimboriumInteractionEvent } from './brimborium-interaction-event';
import { BrimboriumGestureRecognition } from './brimborium-gesture-recognition';

@Injectable({
  providedIn: 'root'
})
export class BrimboriumGestureManager implements IBrimboriumGestureManager {
  public readonly options: BrimboriumGestureOptions;
  public readonly gestureRecognitionOutcome: BrimboriumGestureRecognitionOutcome;
  public readonly gestureInteractionOutcome: BrimboriumGestureInteractionOutcome;

  public readonly gestureRecognition = new EventEmitter<ItemBrimboriumGestureRecognitionOutcome>();
  public readonly gestureInteraction = new EventEmitter<ItemBrimboriumGestureInteractionOutcome>();

  constructor() {
    /* console.log("new BrimboriumGestureManager"); */
    this.options = new BrimboriumGestureOptions();

    this.gestureRecognitionOutcome = new BrimboriumGestureRecognitionOutcome(this.processGestureRecognitionOutcome.bind(this));
    this.gestureInteractionOutcome = new BrimboriumGestureInteractionOutcome(this.processGestureInteractionOutcome.bind(this));

    this.registerRecognition(new BrimboriumGestureRecognitionPrimaryClick());
    this.registerRecognition(new BrimboriumGestureRecognitionSecondaryClick());
    this.registerRecognition(new BrimboriumGestureRecognitionContextMenu());
    this.registerRecognition(new BrimboriumGestureRecognitionDragNDrop());
    this.registerRecognition(new BrimboriumGestureRecognitionReposition());
    this.registerInteraction(new BrimboriumGestureInteractionPrimaryClick(this));
    this.registerInteraction(new BrimboriumGestureInteractionSecondaryClick());
    this.registerInteraction(new BrimboriumGestureInteractionContextMenu());
    this.registerInteraction(new BrimboriumGestureInteractionDragNDrop());
    this.registerInteraction(new BrimboriumGestureInteractionReposition());
  }

  public gestureEventRegistery: IBrimboriumGestureEventRegistery | undefined;
  setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery) {
    this.gestureEventRegistery = gestureEventRegistery;
    this.updateEventListener();
  }
  public mapRecognitionByName = new Map<string, IBrimboriumGestureRecognition>();
  public mapRecognitionByType = new Map<string, IBrimboriumGestureRecognition>();


  public registerRecognition(
    recognition: IBrimboriumGestureRecognition
  ): boolean {
    let result = this.mapRecognitionByName.get(recognition.name);
    if (result == null) {
      this.mapRecognitionByName.set(recognition.name, recognition);
      for (const recognitionType of recognition.getListSupportedGestureName()) {
        this.mapRecognitionByType.set(recognitionType, recognition);
      }
      recognition.initialize(this, this.gestureRecognitionOutcome);
      this.updateEventListener();
      return true;
    } else {
      return false;
    }
  }

  public getRecognition(
    name: string
  ): IBrimboriumGestureRecognition<string> | undefined {
    return this.mapRecognitionByName.get(name);
  }

  public unregisterRecognition(
    name: string
  ): IBrimboriumGestureRecognition<string> | undefined {
    let result = this.mapRecognitionByName.get(name);
    if (result == null) {
      return result;
    } else {
      this.mapRecognitionByName.delete(name);
      return result;
    }
  }

  public getListRecognitionTypeName(): MapIterator<string> {
    return this.mapRecognitionByType.keys();
  }

  public updateEventListener(): boolean {
    const gestureEventRegistery = this.gestureEventRegistery;
    if (gestureEventRegistery == null) {
      // not a bug
      return false;
    } else {
      // may be called only once
      for (const [name, recognition] of this.mapRecognitionByName.entries()) {
        const listSupportedGestureName = recognition.getListSupportedGestureName();
        let needed = false;
        for (const supportedGestureName of listSupportedGestureName) {
          if (this.gestureEnabled.has(supportedGestureName)) {
            needed = true;
            break;
          }
        }
        if (needed) {
          const listEventRegister: GestureEventRegister[] = recognition.getListEventRegister();
          gestureEventRegistery.register(listEventRegister, name);
        } else {
          gestureEventRegistery.register([], name);
        }
        recognition.needUpdateListEventRegister = false;
      }
      return true;
    }
  }

  public onGestureSourceEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: BrimboriumGestureSourceEvent): void {
    this.processGestureSourceEvent(gestureEvent);
  }

  public processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent): void {
    let listGestureRecognitionActive: ([string, IBrimboriumGestureRecognition][]);
    let resetRecognition: boolean;
    do {
      resetRecognition = false;
      listGestureRecognitionActive = [];
      for (const nameRecognition of this.mapRecognitionByName.entries()) {
        if ("Inactive" === nameRecognition[1].state) {
          // ignore
        } else if ("End" === nameRecognition[1].state) {
          nameRecognition[1].state = "Start";
          resetRecognition = true;
          for (const recognition of this.mapRecognitionByName.values()) {
            recognition.resetRecognition(nameRecognition[1]);
          }
          break;
        } else {
          listGestureRecognitionActive.push(nameRecognition);
        }
      }
    } while (resetRecognition);

    this.gestureRecognitionOutcome.suspend();
    for (const [name, recognition] of listGestureRecognitionActive) {
      if (recognition.readyforInputSourceEvent()) {
        // const prevRecognitionState = recognition.state;

        const success = recognition.processGestureSourceEvent(gestureSourceEvent);
        if (success) {
          console.log("success", name, success)
          if (recognition.needUpdateListEventRegister) {
            const gestureEventRegistery = this.gestureEventRegistery;
            if (gestureEventRegistery != null) {
              const listEventRegister: GestureEventRegister[] = recognition.getListEventRegister();
              gestureEventRegistery.register(listEventRegister, name);
              recognition.needUpdateListEventRegister = false;
            }
          }
        }
      } else {
        // skipped
      }
    }
    this.gestureRecognitionOutcome.resume();
  }

  public processGestureRecognitionOutcome(
    recognitionOutcome: ItemBrimboriumGestureRecognitionOutcome
  ) {
    // TODO: effect need a nodeRef
    if ("gestureEvent" === recognitionOutcome.type) {
      // send to gesture and manager
      const gesture = recognitionOutcome.gestureEvent.nodeRef?.gesture;
      if (gesture != null) {
        gesture.processGestureRecognitionOutcome(recognitionOutcome);
      }

      this.gestureRecognition.emit(recognitionOutcome);
      this.processGestureEvent(recognitionOutcome.gestureEvent);
    }
  }
  public resetGestureRecognition(callee: BrimboriumGestureRecognition<any>): void {
    for (const [name, recognition] of this.mapRecognitionByName.entries()) {
      recognition.resetRecognition(callee);
    }
  }

  public mapInteractionByName = new Map<string, IBrimboriumGestureInteraction>();
  public mapInteractionByType = new Map<BrimboriumInteractionTypeName, IBrimboriumGestureInteraction>();

  public registerInteraction(
    interaction: IBrimboriumGestureInteraction
  ): void {
    this.mapInteractionByName.set(interaction.name, interaction);
    for (const interactionType of interaction.getListSupportedInteractionName()) {
      this.mapInteractionByType.set(interactionType, interaction);
    }
    interaction.interactionOutcome = this.gestureInteractionOutcome;
  }

  public getInteraction(
    name: string
  ): IBrimboriumGestureInteraction | undefined {
    return this.mapInteractionByName.get(name);
  }

  public unregisterInteraction(
    name: string
  ): void {
    this.mapInteractionByName.delete(name);
  }

  public getListInteractionTypeName(): MapIterator<string> {
    return this.mapInteractionByType.keys();
  }

  public processGestureEvent(gestureEvent: BrimboriumGestureEvent): void {
    console.log("processGestureEvent", gestureEvent);
    this.gestureInteractionOutcome.suspend();
    // Process the gesture event through all registered interactions
    for (const [name, interaction] of this.mapInteractionByName) {
      const processed = interaction.processGestureEvent(gestureEvent);
      if (processed) {
        break;
      }
    }
    this.gestureInteractionOutcome.resume();
  }

  public processGestureInteractionOutcome(
    interactionOutcome: ItemBrimboriumGestureInteractionOutcome
  ) {
    this.gestureInteraction.emit(interactionOutcome);
    if ("interactionEvent" === interactionOutcome.type) {
      const gesture = interactionOutcome.interactionEvent.nodeRef?.gesture;
      if (gesture != null) {
        gesture.processGestureInteractionOutcome(interactionOutcome);
      }
    }
    if ("iteractionEffect" === interactionOutcome.type) {
      const gesture = interactionOutcome.effect.nodeRef?.gesture;
      if (gesture != null) {
        gesture.processGestureInteractionOutcome(interactionOutcome);
      }
      // TODO: think
      // if (!interactionOutcome.handled){
      //   interactionOutcome.effect.enter();
      //   interactionOutcome.handled=true;
      // }
    }
  }

  calcGestureEnabled(
    interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined
  ): Set<BrimboriumGestureTypeName> | undefined {

    let result: Set<BrimboriumGestureTypeName> | undefined = undefined;
    if ((interactionEnabled != null) && (0 < interactionEnabled.size)) {
      if (result == null) { result = new Set(); }
      for (const interactionName of interactionEnabled) {
        const interaction = this.mapInteractionByType.get(interactionName);
        if (interaction != null) {
          const listGesture = interaction.getListNeededGesture(interactionName)
          for (const gesture of listGesture) {
            result.add(gesture);
          }
        }
      }
    }
    return result;
  }


  public isInterestingOn(eventType: GestureSourceEventName): IsInterestingOn {
    return IsInterestingOn.Yes;
  }

  public eventPreventDefault($event: Event): void {
    // TODO: add the posiblity to override
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
  
  getListRecognitionTypeName() { return this.stateMaschine.getListRecognitionTypeName(); }
  getListInteractionTypeName() { return this.stateMaschine.getListInteractionTypeName(); }
  */

  readonly gestureEnabled = new Set<BrimboriumGestureTypeName>();
  public getGestureEnabled(): Set<BrimboriumGestureTypeName> {
    return this.gestureEnabled;
  }
  public setGestureEnabled(name: BrimboriumGestureTypeName, isEnabled: boolean): boolean {
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

  readonly interactionEnabled = new Set<BrimboriumInteractionTypeName>();

  public getInteractionEnabled(): Set<BrimboriumInteractionTypeName> {
    return this.interactionEnabled;
  }

  public setInteractionEnabled(name: BrimboriumInteractionTypeName, isEnabled: boolean): boolean {
    const current = this.interactionEnabled.has(name);
    if (current === isEnabled) {
      return false;
    } else {
      if (isEnabled) {
        this.interactionEnabled.add(name);
        this.downstreamInteraction();
      } else {
        this.interactionEnabled.delete(name);
      }
      return true;
    }
  }

  public setListInteractionEnabled(value: Partial<Record<BrimboriumInteractionTypeName, boolean>>): this {
    let added = false;
    for (const key in value) {
      const name = key as BrimboriumInteractionTypeName;
      const isEnabled = (true == value[key as BrimboriumInteractionTypeName]);
      const current = this.interactionEnabled.has(name);
      if (current === isEnabled) {
        //
      } else {
        if (isEnabled) {
          this.interactionEnabled.add(name);
          added = true;
        } else {
          this.interactionEnabled.delete(name);
        }
      }
    }
    if (added) {
      this.downstreamInteraction();
    }
    return this;
  }

  private downstreamInteraction(): boolean {
    let result = false;

    for (const nameInteraction of this.interactionEnabled.keys()) {
      const interaction = this.mapInteractionByType.get(nameInteraction);
      if (interaction == null) { continue; }
      const listGesture = interaction.getListNeededGesture(nameInteraction);
      for (const nameGesture of listGesture) {
        if (this.gestureEnabled.has(nameGesture)) {
          //
        } else {
          this.gestureEnabled.add(nameGesture);
          result = true;
        }
      }
    }
    if (result) {
      this.updateEventListener();
    }
    return result;
  }

  // createDragEffect(): IBrimboriumGestureEffect {
  //   return new BrimboriumGestureDragEffect();
  // }

  // processGestureEvent(gestureEvent: BrimboriumGestureEvent): void {
  //   // TODO: process gestureEvent -- handle state -- handle interaction    
  // }
}
