import { TestBed } from '@angular/core/testing';

import { BrimboriumGestureDetectIt } from './brimborium-gesture-detect-it';

describe('BrimboriumGestureDetectIt', () => {
  let service: BrimboriumGestureDetectIt;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrimboriumGestureDetectIt);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
