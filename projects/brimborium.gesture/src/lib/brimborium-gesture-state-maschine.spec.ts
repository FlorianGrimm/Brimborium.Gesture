import { BrimboriumGestureStateMaschine } from './brimborium-gesture-state-maschine';
import { createFaultBrimboriumGestureManager } from './brimborium-gesture-utils';

describe('BrimboriumGestureStateMaschine', () => {
  it('should create an instance', () => {
    expect(new BrimboriumGestureStateMaschine(createFaultBrimboriumGestureManager())).toBeTruthy();
  });
});
