import { BrimboriumGestureRecognition } from './brimborium-gesture-recognition';

describe('BrimboriumGestureRecognition', () => {
  it('should create an instance', () => {
    expect(new BrimboriumGestureRecognition("ContextMenu", "Start")).toBeTruthy();
  });
});
