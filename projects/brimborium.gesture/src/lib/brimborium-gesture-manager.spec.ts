import { TestBed } from '@angular/core/testing';

import { BrimboriumGestureManager } from './brimborium-gesture-manager';

describe('BrimboriumGestureManager', () => {
  let service: BrimboriumGestureManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrimboriumGestureManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
