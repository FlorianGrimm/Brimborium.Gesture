import { TestBed } from '@angular/core/testing';

import { BrimboriumStore } from './brimborium-store';

describe('BrimboriumStore', () => {
  let service: BrimboriumStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrimboriumStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
