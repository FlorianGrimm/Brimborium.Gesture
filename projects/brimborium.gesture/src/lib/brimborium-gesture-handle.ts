import { Directive, ElementRef, inject, InjectionToken, viewChild } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import type { BrimboriumGesture } from './brimborium-gesture';
import { BrimboriumGestureRoot } from './brimborium-gesture-root';


@Directive({
  selector: '[brimboriumGestureHandle]',
  exportAs: 'brimboriumGestureHandle',
  host:{
    'class': 'brimboriumGestureHandle',
  },
  providers: [{ provide: BrimboriumGestureInjectionToken.BrimboriumGestureHandle, useExisting: BrimboriumGestureHandle }],
})
export class BrimboriumGestureHandle {
  readonly element = inject(ElementRef);
  readonly parentGesture = inject<BrimboriumGesture>(BrimboriumGestureInjectionToken.BrimboriumGestureParent, { optional: true, skipSelf: true });
  readonly root = inject<BrimboriumGestureRoot>(BrimboriumGestureInjectionToken.BrimboriumGestureRoot, { skipSelf: true });
  //x=viewChild('#');

  constructor() {
  }

  ngOnInit(): void {
    this.root.registerGestureHandle(this.getHTMLElement(), this);
    if(this.parentGesture != null){
      this.parentGesture.setGestureHandle(this);
    }
  }

  ngOnDestroy(): void {
    this.root.unregisterGestureHandle(this.getHTMLElement(), this);
  }

  getHTMLElement() {
    const result = this.element.nativeElement as HTMLElement;
    return result;
  }
}
