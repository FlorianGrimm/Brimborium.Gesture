// import type { IBrimboriumGestureManager } from "./brimborium-gesture-consts";
// import { BrimboriumGestureRecognition } from "./brimborium-gesture-recognition";
// import { BrimboriumGestureStateMaschine } from "./brimborium-gesture-state-maschine";
// import { Point2D } from "./point2d";

// type BrimboriumGestureRecognitionMouseState
//     = 'Start'
//     | 'Down' | 'Drag'
//     | 'Inactive'
//     | 'End'
//     ;
// export class BrimboriumGestureRecognitionMouse extends BrimboriumGestureRecognition<BrimboriumGestureRecognitionMouseState> {
//     private manager: IBrimboriumGestureManager | undefined;
//     allowedGesture: { primaryClick: boolean; dragNDrop: boolean; reposition: boolean; } = { primaryClick: false, dragNDrop: false, reposition: false };
//     constructor() {
//         super("MouseClick", "Start");
//     }

//     override initialize(
//         stateMaschine: BrimboriumGestureStateMaschine,
//         manager: IBrimboriumGestureManager
//     ): void {
//         this.ListEventRegister = [
//             { eventType: "mousedown", active: true, gestureRecognition: this.name },
//             { eventType: "mouseup", active: true, gestureRecognition: this.name },
//             { eventType: "mousemove", active: false, gestureRecognition: this.name },
//         ];
//         this.needUpdateListEventRegister = true;
//         this.manager = manager;
//     }

//     override readyforInputSourceEvent() {
//         return true;
//     }
//     override process(gestureSourceEvent: BrimboriumGestureSourceEvent): boolean {
//         if (this.manager == null) { return false; }
//         const clientPos: Point2D = new Point2D(
//             (gestureSourceEvent.$event as MouseEvent).clientX,
//             (gestureSourceEvent.$event as MouseEvent).clientY);
//         if ('Start' === this.state) {
//             const gestureAllowed = gestureSourceEvent.getGestureAllowed();
//             if (gestureAllowed == null) { return false; }
//             const primaryClickAllowed = gestureAllowed.has("PrimaryClick");
//             const dragNDropAllowed = gestureAllowed.has("DragNDrop");
//             const repositionAllowed = gestureAllowed.has("Reposition");
//             this.allowedGesture = { primaryClick: primaryClickAllowed, dragNDrop: dragNDropAllowed, reposition: repositionAllowed }
//             if ((primaryClickAllowed || dragNDropAllowed || repositionAllowed)
//                 && (gestureSourceEvent.eventType === "mousedown")) {
//                 const buttons = (gestureSourceEvent.$event as MouseEvent).buttons;
//                 // 1 2 4 | 8 16
//                 //if ((0 !== (buttons & 7)) && (0 == (buttons & 24))) {                }                
//                 //this.setState(BrimboriumGestureRecognitionState.Active);
//                 if (1 === buttons) {
//                     this.gestureEventChain.setEvent(gestureSourceEvent, clientPos);
//                     gestureSourceEvent.preventDefault();
//                     this.state = 'Down';
//                     return true;
//                 }
//             }
//             return false;
//         }

//         if ('Down' === this.state) {
//             if (gestureSourceEvent.eventType === "mousemove") {
//                 if (clientPos.distanceTo(this.gestureEventChain.ListPoints[0]) < 10) {
//                     // do nothing
//                 } else {
//                     this.gestureEventChain.setEvent(gestureSourceEvent, clientPos);
//                     this.state = 'Drag';
//                     gestureSourceEvent.preventDefault();
//                     const listOutcome = (this.listOutcome ??= []);                    
//                     // TODO: find a better solution listOutcome.push({ type: 'effect', effect: this.manager.createDragEffect() });
//                     const eventDragStart = new BrimboriumGestureEvent(
//                         "dragStart",
//                         gestureSourceEvent.target,
//                         gestureSourceEvent.timeStamp,
//                         clientPos,
//                         gestureSourceEvent.nodeRef,
//                         gestureSourceEvent.$event
//                     );
//                     listOutcome.push({ type: 'gestureEvent', gestureEvent: eventDragStart });
//                 }
//                 return true;
//             }
//             if (gestureSourceEvent.eventType === "mouseup") {
//                 this.gestureEventChain.setEvent(gestureSourceEvent, clientPos);
//                 this.state = 'End';
//                 gestureSourceEvent.preventDefault();
//                 const listOutcome = (this.listOutcome ??= []);                    
//                 const eventDragMove = new BrimboriumGestureEvent(
//                         "dragMove",
//                         gestureSourceEvent.target,
//                         gestureSourceEvent.timeStamp,
//                         clientPos,
//                         gestureSourceEvent.nodeRef,
//                         gestureSourceEvent.$event
//                     );
//                     listOutcome.push({ type: 'gestureEvent', gestureEvent: eventDragMove });
//                 return true;
//             }
//         }
//         if ('Drag' === this.state) {
//         }

//         return false;
//     }
// }