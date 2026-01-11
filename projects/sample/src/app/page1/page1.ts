import { Component } from '@angular/core';

@Component({
  selector: 'app-page1',
  imports: [],
  templateUrl: './page1.html',
  styleUrl: './page1.scss',
})
export class Page1 {
  onMouseDown($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onMouseUp($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onMouseMove($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onMouseEnter($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onMouseOver($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onMouseLeave($event: MouseEvent) {
    log($event);
    $event.preventDefault();
  }
  onTouchStart($event: TouchEvent) {
    log($event);
    //$event.preventDefault();
  }
  onTouchMove($event: TouchEvent) {
    log($event);
    //$event.preventDefault();
  }
  onTouchEnd($event: TouchEvent) {
    log($event);
    //$event.preventDefault();
  }
}
function log($event: MouseEvent | TouchEvent) {
  const element = $event.target as HTMLElement;
  console.log(element.id, $event.type, $event);
}

