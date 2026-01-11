import { Directive, DOCUMENT, ElementRef, inject, input, NgZone, OnDestroy, OnInit, RendererFactory2 } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import { BrimboriumGestureManager } from './brimborium-gesture-manager';
import { BrimboriumGestureNodeRef } from './brimborium-gesture-node-ref';
import type { BrimboriumGestureHandle } from './brimborium-gesture-handle';
import type { BrimboriumGesture } from './brimborium-gesture';
import { BrimboriumGestureSourceEvent, GestureSourceEventName, IBrimboriumGestureRoot, IsInterestingOn, MouseGestureEventName, TouchGestureEventName } from './brimborium-gesture-consts';
import { EventManager } from '@angular/platform-browser';
import { BrimboriumGestureEventRegistery } from './brimborium-gesture-event-registery';

@Directive({
  selector: '[brimboriumGestureRoot]',
  exportAs: 'brimboriumGestureRoot',
  host: {
    /*
    '(mousedown)': 'onMouseGesture($event)',
    '(mouseup)': 'onMouseGesture($event)',
    '(mousemove)': 'onMouseGesture($event)',
    '(mouseenter)': 'onMouseGesture($event)',
    '(mouseover)': 'onMouseGesture($event)',
    '(mouseleave)': 'onMouseGesture($event)',
    '(touchstart)': 'onTouchGesture($event)',
    '(touchmove)': 'onTouchGesture($event)',
    '(touchend)': 'onTouchGesture($event)',
    */
  },
  providers: [{ provide: BrimboriumGestureInjectionToken.BrimboriumGestureRoot, useExisting: BrimboriumGestureRoot }],
})
export class BrimboriumGestureRoot implements IBrimboriumGestureRoot, OnInit, OnDestroy {
  readonly element = inject(ElementRef);
  readonly manager = inject(BrimboriumGestureManager);
  readonly mapNodeRef = new WeakMap<HTMLElement, BrimboriumGestureNodeRef>();

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

  addEventListener(eventName: string, active: boolean) {
    const handler = this.getEventHandler(eventName, active);
    if (handler == null) {
      return;
    } else {
      this.eventManager.addEventListener(this.element.nativeElement, eventName, handler,  { passive: !active });
    }
  }

  removeEventListener(eventName: string, active: boolean) {
    const handler = this.getEventHandler(eventName, active);
    if (handler == null) {
      return;
    } else {
      this.eventManager.addEventListener(this.element.nativeElement, eventName, handler, { passive: !active });
    }
  }

  getEventHandler(eventName: string, active: boolean): Function | undefined {
    return active ? this.onGestureActive : this.onGesturePassive;
  }

  /* eventhandler */

  onGestureActive($event: Event) {
    const $eventType = $event.type as GestureSourceEventName;

    const targetElement = BrimboriumGestureSourceEvent.ensureTargetHTMLElement($event.target)
    const isInterestingOn = this.manager.isInterestingOn($eventType);
    if (IsInterestingOn.No == isInterestingOn || targetElement == null) {
      this.manager.eventPreventDefault($event);
    } else {
      const nodeRef = this.getNodeRef($event.target) ?? undefined;
      if (nodeRef == null && IsInterestingOn.YesIfNodeRef == isInterestingOn) {
        this.manager.eventPreventDefault($event);
      } else {
        const gestureEvent = new BrimboriumGestureSourceEvent($eventType, targetElement, $event.timeStamp, nodeRef, $event);
        this.manager.onGestureEvent(this, gestureEvent);
        if (gestureEvent.eventPreventDefault) {
          this.manager.eventPreventDefault($event);
        }
      }
    }
  }

  onGesturePassive($event: MouseEvent) {
    const $eventType = $event.type as GestureSourceEventName;
    if (MouseGestureEventName.findIndex((item) => ($eventType === item)) < 0) {
      console.error("onMouseGesture unexpected $event.type", $eventType);
      return;
    }

    const targetElement = BrimboriumGestureSourceEvent.ensureTargetHTMLElement($event.target)
    const isInterestingOn = this.manager.isInterestingOn($eventType);
    if (IsInterestingOn.No == isInterestingOn || targetElement == null) {
      //
    } else {
      const nodeRef = this.getNodeRef($event.target) ?? undefined;
      if (nodeRef == null && IsInterestingOn.YesIfNodeRef == isInterestingOn) {
        //
      } else {
        const gestureEvent = new BrimboriumGestureSourceEvent($eventType, targetElement, $event.timeStamp, nodeRef, $event);
        this.manager.onGestureEvent(this, gestureEvent);
      }
    }
  }

}
