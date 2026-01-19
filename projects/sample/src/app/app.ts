import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrimboriumGestureManager, BrimboriumGestureModule } from 'Brimborium.Gesture';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sample');
  readonly brimboriumGestureManager = inject(BrimboriumGestureManager);
  constructor() {
    this.brimboriumGestureManager.setListInteractionEnabled(
      {
        PrimaryClick: true,
        PrimaryLongClick: true,
        PrimaryDoubleClick: true,
      });
  }
}
