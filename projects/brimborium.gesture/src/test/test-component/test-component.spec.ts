import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test-component';
import { BrimboriumGestureManager, BrimboriumGestureModule, BrimboriumGestureRoot } from '../../public-api';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestComponent,
        BrimboriumGestureModule
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('brimboriumGestureRootRef',()=>{
    expect(component.brimboriumGestureRootRef).toBeTruthy();
    // expect(Object.keys(component.brimboriumGestureRootRef) ).toBe([]);
    // console.log(component.brimboriumGestureRootRef);
  })
});
