# BrimboriumGesture

A modern, Angular 21+ gesture recognition library that unifies mouse, touch, and pointer events into a powerful, declarative API for building interactive web applications.

## Vision

Extract and combine the best features from leading gesture libraries:
- **Angular CDK Drag & Drop** - Robust drag-n-drop with accessibility
- **Westures** - Advanced multi-touch gesture recognition
- **Dragula.js** - Intuitive container-to-container transfers
- **Custom enhancements** - Modern Angular patterns with signals

## Features

### Unified Input Handling
- Normalize Mouse, Touch, and Pointer events into a single API
- Automatic device detection and optimization
- Passive event listeners for better performance

### Gesture Recognition
- **Basic**: Tap, Double Tap, Long Press, Swipe (4 directions), Pan
- **Multi-touch**: Pinch, Rotate, Two-finger Pan
- **Advanced**: Velocity-based swipes, Custom gesture composition

### Drag & Drop System
- Free drag with boundary constraints
- Axis-locked dragging (horizontal/vertical only)
- Container-to-container transfers
- Sortable lists with auto-scroll
- Visual feedback (ghost elements, placeholders, drop zones)

### Transform Operations
- **Move/Reposition**: Free positioning, snap-to-grid, magnetic alignment
- **Resize**: Corner/edge handles, aspect ratio locking, min/max constraints
- **Rotate**: Free rotation, snap angles, multi-touch rotation

### Developer Experience
- Declarative directive-based API
- Angular signals for reactive state
- TypeScript-first with full type safety
- Composable gesture behaviors
- Built-in accessibility (keyboard support, ARIA attributes)

### Performance
- Zone.js optimized event handling
- RequestAnimationFrame-based updates
- Efficient change detection with OnPush strategy
- Tree-shakeable and optimized for production

## Installation

```bash
npm install brimborium.gesture
```

## Quick Start

### Basic Drag

```typescript
import { BrimboriumGesture } from 'brimborium.gesture';

@Component({
  selector: 'app-example',
  imports: [BrimboriumGesture],
  template: `
    <div libBrimboriumGesture
         [gestureType]="'drag'"
         (gestureStart)="onDragStart($event)"
         (gestureMove)="onDragMove($event)"
         (gestureEnd)="onDragEnd($event)">
      Drag me!
    </div>
  `
})
export class ExampleComponent {
  onDragStart(event: GestureEvent) {
    console.log('Drag started', event);
  }

  onDragMove(event: GestureEvent) {
    console.log('Dragging', event.delta);
  }

  onDragEnd(event: GestureEvent) {
    console.log('Drag ended', event);
  }
}
```

### Gesture Recognition

```typescript
<div libBrimboriumGesture
     [gestures]="['tap', 'swipe', 'pinch']"
     (tap)="onTap($event)"
     (swipe)="onSwipe($event)"
     (pinch)="onPinch($event)">
  Multi-gesture element
</div>
```

### Drag & Drop Between Containers

```typescript
<div libGestureDropZone
     [dropZoneId]="'zone1'"
     (itemDropped)="onDrop($event)">
  <div *ngFor="let item of items"
       libBrimboriumGesture
       [gestureDraggable]="true"
       [dragData]="item">
    {{ item.name }}
  </div>
</div>
```

## Architecture

### Directives
- **`libBrimboriumGesture`** - Main gesture directive for element interaction
- **`libGestureDropZone`** - Drop zone container for drag-n-drop
- **`libGestureDraggable`** - Draggable item configuration
- **`libGestureResizable`** - Resize handles and constraints
- **`libGestureRotatable`** - Rotation interaction

### Services
- **`BrimboriumGestureManager`** - Global gesture coordination and conflict resolution
- **`GestureRecognizer`** - Low-level gesture detection engine
- **`DragDropService`** - Drag-n-drop state management
- **`TransformService`** - Transform operation utilities

### Models
- **`GestureEvent`** - Unified gesture event interface
- **`GestureConfig`** - Configuration options
- **`DragDropContext`** - Drag-n-drop state
- **`TransformState`** - Element transform state (position, rotation, scale)

## API Reference

### Gesture Types
```typescript
type GestureType =
  | 'tap' | 'doubletap' | 'longpress'
  | 'swipe' | 'pan'
  | 'pinch' | 'rotate'
  | 'drag' | 'resize';
```

### Gesture Event
```typescript
interface GestureEvent {
  type: GestureType;
  target: HTMLElement;
  originalEvent: MouseEvent | TouchEvent | PointerEvent;
  position: { x: number; y: number };
  delta?: { x: number; y: number };
  velocity?: { x: number; y: number };
  scale?: number;
  rotation?: number;
  distance?: number;
}
```

### Configuration
```typescript
interface GestureConfig {
  // Tap configuration
  tapTimeout?: number;           // Default: 250ms
  doubleTapInterval?: number;    // Default: 300ms
  longPressDelay?: number;       // Default: 500ms

  // Swipe configuration
  swipeThreshold?: number;       // Default: 50px
  swipeVelocity?: number;        // Default: 0.3px/ms

  // Drag configuration
  dragThreshold?: number;        // Default: 5px
  dragAxis?: 'x' | 'y' | 'both'; // Default: 'both'
  dragBoundary?: DOMRect | 'parent' | 'viewport';

  // Multi-touch configuration
  pinchThreshold?: number;       // Default: 0.1
  rotateThreshold?: number;      // Default: 5 degrees
}
```

## Development

### Build the library
```bash
ng build Brimborium.Gesture
```

### Run tests
```bash
ng test Brimborium.Gesture
```

### Run sample app
```bash
npm start
```

## Roadmap

- [x] Project setup and architecture
- [ ] Core gesture recognition engine
- [ ] Basic gestures (tap, swipe, pan)
- [ ] Multi-touch gestures (pinch, rotate)
- [ ] Drag & drop system
- [ ] Resize & rotate directives
- [ ] Visual feedback system
- [ ] Accessibility features
- [ ] Performance optimizations
- [ ] Comprehensive documentation
- [ ] Example gallery

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Inspired by the excellent work of:
- Angular CDK team
- Westures contributors
- Dragula.js creator
- The Angular community