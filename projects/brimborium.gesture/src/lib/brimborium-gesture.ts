import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { BrimboriumGestureInjectionToken } from './brimborium-gesture-inject-tokens';
import type { BrimboriumGestureRoot } from './brimborium-gesture-root';
import { BrimboriumGestureHandle } from './brimborium-gesture-handle';
import { BrimboriumGestureList } from './brimborium-gesture-list';
import type { BrimboriumGestureName, SourceArrayValue } from './brimborium-gesture-consts';

@Directive({
  selector: '[brimboriumGesture]',
  exportAs: 'brimboriumGesture',
  host: {
    'class': 'brimboriumGesture',
    '[class.brimboriumGestureAndHandle]': '$isGestureHandle()',
  },
  providers: [{ provide: BrimboriumGestureInjectionToken.BrimboriumGestureParent, useExisting: BrimboriumGesture }],

})
export class BrimboriumGesture<Kind extends string = any, Data = any> implements OnInit, AfterViewInit, OnDestroy {
  readonly element = inject(ElementRef);
  readonly gestureRoot = inject<BrimboriumGestureRoot>(BrimboriumGestureInjectionToken.BrimboriumGestureRoot, { skipSelf: true });
  readonly gestureList = inject<BrimboriumGestureList>(BrimboriumGestureInjectionToken.BrimboriumGestureList, { optional: true, skipSelf: true });

  readonly gestureKind = input<Kind>();
  readonly gestureData = input<Data>();
  readonly gestureAllowed = input<SourceArrayValue<BrimboriumGestureName>>();

  readonly $isGestureHandle = signal<boolean>(false);

  gestureHandle: BrimboriumGestureHandle | undefined;

  constructor() {
  }

  ngOnInit(): void {
    this.gestureRoot.registerGesture(this.getHTMLElement(), this);
  }

  setGestureHandle(gestureHandle: BrimboriumGestureHandle) {
    this.gestureHandle = gestureHandle;
    this.setIsGestureHandle(undefined);
  }

  ngAfterViewInit(): void {
    this.setIsGestureHandle(undefined);
  }

  setIsGestureHandle(value: boolean | undefined): boolean {
    if (value == null) {
      value = (this.gestureHandle == null);
    }
    if (value === this.$isGestureHandle()) {
      return false;
    } else {
      this.$isGestureHandle.set(value);
      return true;
    }
  }

  ngOnDestroy(): void {
    this.gestureRoot.unregisterGesture(this.getHTMLElement(), this);
  }

  getHTMLElement() {
    const result = this.element.nativeElement as HTMLElement;
    return result;
  }

}
