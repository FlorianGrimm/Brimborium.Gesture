import { Directive, inject } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import type { BrimboriumGestureRoot } from './brimborium-gesture-root';

@Directive({
  selector: '[brimboriumGestureList]',
  providers: [{provide: BrimboriumGestureInjectionToken.BrimboriumGestureList, useExisting: BrimboriumGestureList}],  
})
export class BrimboriumGestureList {
  private root = inject<BrimboriumGestureRoot>(BrimboriumGestureInjectionToken.BrimboriumGestureRoot, {skipSelf: true});

  constructor() { }

}
