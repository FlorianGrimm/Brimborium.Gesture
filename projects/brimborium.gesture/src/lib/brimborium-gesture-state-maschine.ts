import {
    BrimboriumGestureRecognitionOutcome,
    IBrimboriumGestureRecognition,
    IBrimboriumGestureEventRegistery,
    IBrimboriumGestureRoot,
    IBrimboriumGestureManager,
    IBrimboriumGestureInteraction,
} from "./brimborium-gesture-consts";
import { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import type { BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";

export class BrimboriumGestureStateMaschine {
    public gestureEventRegistery: IBrimboriumGestureEventRegistery | undefined;

    constructor(
        public manager: IBrimboriumGestureManager
    ) {
    }

    public setGestureEventRegistery(gestureEventRegistery: IBrimboriumGestureEventRegistery) {
        this.gestureEventRegistery = gestureEventRegistery;
        this.updateEventListener();
    }

    public mapGestureRecognition = new Map<string, IBrimboriumGestureRecognition>();

    public registerRecognition(
        recognition: IBrimboriumGestureRecognition
    ) {
        let result = this.mapGestureRecognition.get(recognition.name);
        if (result == null) {
            this.mapGestureRecognition.set(recognition.name, recognition);
            recognition.initialize(this, this.manager);
            recognition.reset(undefined);
            this.updateEventListener();
            return true;
        } else {
            return false;
        }
    }

    public getRecognition(
        name: string
    ) {
        return this.mapGestureRecognition.get(name);
    }

    public unregisterRecognition(
        name: string
    ) {
        let result = this.mapGestureRecognition.get(name);
        if (result == null) {
            return result;
        } else {
            this.mapGestureRecognition.delete(name);
            return result;
        }
    }

    public updateEventListener() {
        const gestureEventRegistery = this.gestureEventRegistery;
        if (gestureEventRegistery == null) {
            // not a bug
            return false;
        } else {
            // may be called only once
            for (const [name, recognition] of this.mapGestureRecognition.entries()) {
                const listEventRegister: GestureEventRegister[] = recognition.getListEventRegister();
                gestureEventRegistery.register(listEventRegister, name);
            }
            return true;
        }
    }

    onGestureSourceEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: BrimboriumGestureSourceEvent): void {
        this.processGestureSourceEvent(gestureEvent);
    }

    processGestureSourceEvent(gestureSourceEvent: BrimboriumGestureSourceEvent) {
        let listRecognitionResult: BrimboriumGestureRecognitionOutcome = undefined;
        let listFinished: undefined | (IBrimboriumGestureRecognition<string>[]) = undefined;
        let resetRecognition = false;
        const listGestureRecognitionActive: ([string, IBrimboriumGestureRecognition][]) = [];
        for (const nameRecognition of this.mapGestureRecognition.entries()) {
            if ("Inactive" === nameRecognition[1].state) {
                // ignore
            } else if ("End" === nameRecognition[1].state) {
                // why? - TODO - how to handle...
            } else {
                listGestureRecognitionActive.push(nameRecognition);
                nameRecognition[1].getListEventRegister
            }
        }
        for (const [name, recognition] of this.mapGestureRecognition.entries()) {
            if (recognition.readyforInputSourceEvent()) {
                // const prevRecognitionState = recognition.state;

                const changed = recognition.process(gestureSourceEvent);
                if (changed) {
                    if (recognition.needUpdateListEventRegister) {
                        const gestureEventRegistery = this.gestureEventRegistery;
                        if (gestureEventRegistery != null) {
                            const listEventRegister: GestureEventRegister[] = recognition.getListEventRegister();
                            gestureEventRegistery.register(listEventRegister, name);
                            recognition.needUpdateListEventRegister = false;
                        }
                    }
                    if (recognition.listOutcome != null) {
                        (listRecognitionResult ??= []).push(...recognition.listOutcome);
                        recognition.listOutcome = undefined;
                    }
                    if ('End' === recognition.state) {
                        resetRecognition = true;
                        (listFinished ??= []).push(recognition);
                    }
                }
            } else {
                // skipped
            }
        }
        if (listRecognitionResult != null) {
            for (const recognitionOutcome of listRecognitionResult) {
                if ("gestureEvent" === recognitionOutcome.type) {
                    // send to gesture and manager
                    const gestureEvent = recognitionOutcome.gestureEvent;
                    const gesture = recognitionOutcome.gestureEvent.nodeRef?.gesture;
                    if (gesture != null) {
                        gesture.processGestureEvent(gestureEvent);
                    }
                    this.manager.processGestureEvent(gestureEvent);
                    this.processGestureEvent(gestureEvent);
                }
            }
        }
        if (resetRecognition) {
            for (const [name, recognition] of this.mapGestureRecognition.entries()) {
                recognition.reset(listFinished);
            }
        }
    }
    processGestureEvent(gestureEvent: BrimboriumGestureEvent) {
        for (const [name, interaction] of this.mapGestureInteraction) {
            //interaction.state
        }
    }

    public mapGestureInteraction = new Map<string, IBrimboriumGestureInteraction>();

    public registerInteraction(
        interaction: IBrimboriumGestureInteraction
    ): void {
        this.mapGestureInteraction.set(interaction.name, interaction);
    }

    public getInteraction(
        name: string
    ): IBrimboriumGestureInteraction | undefined {
        return this.mapGestureInteraction.get(name);
    }

    public unregisterInteraction(
        name: string
    ): void {
        this.mapGestureInteraction.delete(name);
    }

    // public ListStartDefinition: BrimboriumGestureDefinition[] = [];
    // registerDefinition(
    //     definition: BrimboriumGestureDefinition
    // ) {
    //     this.ListStartDefinition.push(definition);
    //     const listGestureRecognition = definition.getListGestureRecognition();
    //     if (0 < listGestureRecognition.length) {
    //         for (const recognition of listGestureRecognition) {
    //             this.registerRecognition(recognition);
    //         }
    //     }
    //     const listStartPhase = definition.getListStartPhase();
    //     if (0 < listStartPhase.length) { this.ListCurrentPhase.push(...listStartPhase); }
    // }

    // public listInteraction: BrimboriumGestureInteraction[] = [];
    // registerInteraction(
    //     interaction: BrimboriumGestureInteraction
    // ) {
    //     this.listInteraction.push(interaction);
    // }

    // public ListCurrentPhase: BrimboriumGesturePhase[] = [];
    // public ListCurrentState: BrimboriumGestureState[] = [];


}
