import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import { BrimboriumGestureManager } from './brimborium-gesture-manager';
import { BrimboriumGestureNodeRef } from './brimborium-gesture-node-ref';
import { EventManager } from '@angular/platform-browser';
import { BrimboriumGestureEventRegistery } from './brimborium-gesture-event-registery';
import type { BrimboriumGestureHandle } from './brimborium-gesture-handle';
import type { BrimboriumGesture } from './brimborium-gesture';
import { BrimboriumGestureSourceEvent } from './brimborium-gesture-source-event';
import {
  GestureSourceEventName,
  IBrimboriumGestureRoot,
  IsInterestingOn,
  ItemBrimboriumGestureInteractionOutcome,
  ItemBrimboriumGestureRecognitionOutcome
} from './brimborium-gesture-consts';

@Directive({
  selector: '[brimboriumGestureRoot]',
  exportAs: 'brimboriumGestureRoot',
  providers: [
    { provide: BrimboriumGestureInjectionToken.BrimboriumGestureRoot, useExisting: BrimboriumGestureRoot }
  ],
})
export class BrimboriumGestureRoot implements IBrimboriumGestureRoot, OnInit, OnDestroy {
  public readonly element = inject(ElementRef);
  public readonly manager = inject(BrimboriumGestureManager);
  public readonly mapNodeRef = new WeakMap<HTMLElement, BrimboriumGestureNodeRef>();
  public readonly gestureRecognitionOutcome = output<ItemBrimboriumGestureRecognitionOutcome>();
  public readonly interactionOutcome = output<ItemBrimboriumGestureInteractionOutcome>()


  /* readonly eventElement = input<ElementRef>(); */

  /*
  private readonly _ngZone = inject(NgZone);
  private readonly _document = inject(DOCUMENT);
  private readonly _renderer = inject(RendererFactory2).createRenderer(null, null);
  */

  private gestureEventRegistery = new BrimboriumGestureEventRegistery(
    (eventName, active) => { this.addEventListener(eventName, active); },
    (eventName, active) => { this.removeEventListener(eventName, active); });

  constructor() {
    this.onGestureActive = this.onGestureActive.bind(this);
    this.onGesturePassive = this.onGesturePassive.bind(this);
    this.manager.setGestureEventRegistery(this.gestureEventRegistery);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  registerGesture(element: HTMLElement, value: BrimboriumGesture) {
    let result = this.mapNodeRef.get(element);
    if (result == null) {
      result = new BrimboriumGestureNodeRef();
      this.mapNodeRef.set(element, result);
    }
    result.setGesture(value);
  }

  unregisterGesture(element: HTMLElement, value: BrimboriumGesture) {
    this.mapNodeRef.delete(element);
  }

  registerGestureHandle(element: HTMLElement, gestureHandle: BrimboriumGestureHandle) {
    let result = this.mapNodeRef.get(element);
    if (result == null) {
      result = new BrimboriumGestureNodeRef();
      this.mapNodeRef.set(element, result);
    }
    result.setGestureHandle(gestureHandle);
  }

  unregisterGestureHandle(element: HTMLElement, value: BrimboriumGestureHandle) {
    this.mapNodeRef.delete(element);
  }

  getNodeRef(target: EventTarget | null) {
    if (target == null) { return null; }
    const nodeRef = this.mapNodeRef.get(target as HTMLElement);
    return nodeRef;
  }

  readonly eventManager = inject(EventManager);
  mapRemoveEventListener = new Map<string, Function>();
  addEventListener(eventName: string, active: boolean) {
    const handler = this.getEventHandler(eventName, active);
    if (handler == null) {
      return;
    } else {
      const dispose = this.eventManager.addEventListener(this.element.nativeElement, eventName, handler, { passive: !active });
      this.mapRemoveEventListener.set(eventName, dispose);
      console.log("addEventListener", eventName);
    }
  }

  removeEventListener(eventName: string, active: boolean) {
    const dispose = this.mapRemoveEventListener.get(eventName);
    if (dispose != null) {
      dispose();
    }
  }

  getEventHandler(eventName: string, active: boolean): Function | undefined {
    return active ? this.onGestureActive : this.onGesturePassive;
  }

  /* eventhandler */

  onGestureActive($event: Event) {
    const $eventType = $event.type as GestureSourceEventName;
    // console.log("onGestureActive", $event);

    const targetElement = BrimboriumGestureSourceEvent.ensureTargetHTMLElement($event.target)
    const isInterestingOn = this.manager.isInterestingOn($eventType);
    if (IsInterestingOn.No == isInterestingOn || targetElement == null) {
      this.manager.eventPreventDefault($event);
    } else {
      const nodeRef = this.getNodeRef($event.target) ?? undefined;
      if (nodeRef == null && IsInterestingOn.YesIfNodeRef == isInterestingOn) {
        this.manager.eventPreventDefault($event);
      } else {
        const gestureEvent = new BrimboriumGestureSourceEvent($eventType, targetElement, $event.timeStamp, nodeRef, $event, this.manager);
        this.manager.onGestureSourceEvent(this, gestureEvent);
        if (gestureEvent.eventPreventDefault) {
          this.manager.eventPreventDefault($event);
        }
      }
    }
  }

  onGesturePassive($event: MouseEvent) {
    // console.log("onGesturePassive", $event);
    const $eventType = $event.type as GestureSourceEventName;

    const targetElement = BrimboriumGestureSourceEvent.ensureTargetHTMLElement($event.target)
    const isInterestingOn = this.manager.isInterestingOn($eventType);
    if (IsInterestingOn.No == isInterestingOn || targetElement == null) {
      //
    } else {
      const nodeRef = this.getNodeRef($event.target) ?? undefined;
      if (nodeRef == null && IsInterestingOn.YesIfNodeRef == isInterestingOn) {
        //
      } else {
        const gestureEvent = new BrimboriumGestureSourceEvent($eventType, targetElement, $event.timeStamp, nodeRef, $event, this.manager);
        this.manager.onGestureSourceEvent(this, gestureEvent);
      }
    }
  }

  public processGestureRecognitionOutcome(
    gestureRecognitionOutcome: ItemBrimboriumGestureRecognitionOutcome
  ) {
    this.gestureRecognitionOutcome.emit(gestureRecognitionOutcome);
  }

  public processGestureInteractionOutcome(
    gestureInteractionOutcome: ItemBrimboriumGestureInteractionOutcome
  ) {
    this.interactionOutcome.emit(gestureInteractionOutcome);
  }
}
