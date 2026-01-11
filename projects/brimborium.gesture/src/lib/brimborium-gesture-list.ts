import { Directive, inject, output } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import type { BrimboriumGestureRoot } from './brimborium-gesture-root';
import type { BrimboriumGestureEvent } from './brimborium-gesture-event';

@Directive({
  selector: '[brimboriumGestureList]',
  providers: [{provide: BrimboriumGestureInjectionToken.BrimboriumGestureList, useExisting: BrimboriumGestureList}],  
})
export class BrimboriumGestureList {
  private root = inject<BrimboriumGestureRoot>(BrimboriumGestureInjectionToken.BrimboriumGestureRoot, {skipSelf: true});

  readonly gestureEvent = output<BrimboriumGestureEvent>();
  
  constructor() { }

  processGestureEvent(gestureEvent: BrimboriumGestureEvent) {
    this.gestureEvent.emit(gestureEvent);
  }

}
