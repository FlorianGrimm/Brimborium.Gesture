import {
  Directive, inject, output
} from '@angular/core';
import {
  BrimboriumGestureInjectionToken
} from './brimborium-gesture-inject-tokens';
import {
  type BrimboriumGestureRoot
} from './brimborium-gesture-root';
import {
  type ItemBrimboriumGestureInteractionOutcome,
  type ItemBrimboriumGestureRecognitionOutcome
} from './brimborium-gesture-consts';

@Directive({
  selector: '[brimboriumGestureList]',
  providers: [{ provide: BrimboriumGestureInjectionToken.BrimboriumGestureList, useExisting: BrimboriumGestureList }],
})
export class BrimboriumGestureList {
  private root = inject<BrimboriumGestureRoot>(BrimboriumGestureInjectionToken.BrimboriumGestureRoot, { skipSelf: true });

  public readonly gestureRecognitionOutcome = output<ItemBrimboriumGestureRecognitionOutcome>();
  public readonly interactionOutcome = output<ItemBrimboriumGestureInteractionOutcome>()

  constructor() { }

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
