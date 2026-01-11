import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { BrimboriumGestureRoot, BrimboriumGesture, BrimboriumGestureModule } from '../../public-api';

@Component({
  selector: 'lib-test-component',
  imports: [
    BrimboriumGestureModule
],
  templateUrl: './test-component.html',
  styleUrl: './test-component.css',
})
export class TestComponent {
   @ViewChild('brimboriumGestureRoot') brimboriumGestureRootRef!: ElementRef<BrimboriumGestureRoot>;
}
