import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrimboriumOverlay } from './brimborium.overlay';

describe('BrimboriumOverlay', () => {
  let component: BrimboriumOverlay;
  let fixture: ComponentFixture<BrimboriumOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrimboriumOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrimboriumOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
