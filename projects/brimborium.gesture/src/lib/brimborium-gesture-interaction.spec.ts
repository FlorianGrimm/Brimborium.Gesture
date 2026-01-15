import { BrimboriumGestureInteraction } from './brimborium-gesture-interaction';

describe('BrimboriumGestureInteraction', () => {
  it('should create an instance', () => {
    expect(new BrimboriumGestureInteraction("ContextMenu", "Start")).toBeTruthy();
  });
});
