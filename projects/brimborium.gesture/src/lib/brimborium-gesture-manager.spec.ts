import { TestBed } from '@angular/core/testing';

import { BrimboriumGestureManager } from './brimborium-gesture-manager';

describe('BrimboriumGestureManager', () => {
  let service: BrimboriumGestureManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrimboriumGestureManager);
  });

  it('getListRecognitionTypeName', () => {
    expect(Array.from(service.getListRecognitionTypeName())).toStrictEqual(["PrimaryClick",]);
  });
});
