import { iterator } from "rxjs/internal/symbol/iterator";
import {
    IBrimboriumGestureRecognition,
    IBrimboriumGestureEventRegistery,
    IBrimboriumGestureRoot,
    IBrimboriumGestureManager,
    IBrimboriumGestureInteraction,
    BrimboriumInteractionTypeName,
    BrimboriumGestureTypeName,
    SourceArrayValue,
} from "./brimborium-gesture-consts";
import { BrimboriumGestureEvent } from "./brimborium-gesture-event";
import type { GestureEventRegister } from "./brimborium-gesture-event-registery";
import { BrimboriumGestureRecognitionOutcome } from "./brimborium-gesture-recognition-outcome";
import { combineStringAllowed, sourceArrayValueAsIteratorLike, type BrimboriumGestureSourceEvent } from "./brimborium-gesture-source-event";

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

    public mapGestureRecognitionByName = new Map<string, IBrimboriumGestureRecognition>();
    public mapGestureRecognitionByType = new Map<string, IBrimboriumGestureRecognition>();

    public outcome = new BrimboriumGestureRecognitionOutcome();
    public registerRecognition(
        recognition: IBrimboriumGestureRecognition
    ) {
        let result = this.mapGestureRecognitionByName.get(recognition.name);
        if (result == null) {
            this.mapGestureRecognitionByName.set(recognition.name, recognition);
            for (const recognitionType in recognition.getListSupportedGestureName()) {
                this.mapGestureRecognitionByType.set(recognitionType, recognition);
            }
            recognition.initialize(this, this.manager, this.outcome);
            recognition.resetRecognition(undefined, this.outcome);
            this.updateEventListener();
            return true;
        } else {
            return false;
        }
    }

    public getRecognition(
        name: string
    ) {
        return this.mapGestureRecognitionByName.get(name);
    }

    public unregisterRecognition(
        name: string
    ) {
        let result = this.mapGestureRecognitionByName.get(name);
        if (result == null) {
            return result;
        } else {
            this.mapGestureRecognitionByName.delete(name);
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
            for (const [name, recognition] of this.mapGestureRecognitionByName.entries()) {
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
        let listFinished: undefined | (IBrimboriumGestureRecognition<string>[]) = undefined;
        let resetRecognition = false;
        const listGestureRecognitionActive: ([string, IBrimboriumGestureRecognition][]) = [];
        for (const nameRecognition of this.mapGestureRecognitionByName.entries()) {
            if ("Inactive" === nameRecognition[1].state) {
                // ignore
            } else if ("End" === nameRecognition[1].state) {
                // why? - TODO - how to handle...
            } else {
                listGestureRecognitionActive.push(nameRecognition);
                nameRecognition[1].getListEventRegister
            }
        }
        for (const [name, recognition] of this.mapGestureRecognitionByName.entries()) {
            if (recognition.readyforInputSourceEvent()) {
                // const prevRecognitionState = recognition.state;

                const changed = recognition.processGestureSourceEvent(gestureSourceEvent);
                if (changed) {
                    if (recognition.needUpdateListEventRegister) {
                        const gestureEventRegistery = this.gestureEventRegistery;
                        if (gestureEventRegistery != null) {
                            const listEventRegister: GestureEventRegister[] = recognition.getListEventRegister();
                            gestureEventRegistery.register(listEventRegister, name);
                            recognition.needUpdateListEventRegister = false;
                        }
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

        if (this.outcome.listOutcome != null) {
            for (const recognitionOutcome of this.outcome.listOutcome) {
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
            for (const [name, recognition] of this.mapGestureRecognitionByName.entries()) {
                recognition.resetRecognition(listFinished, this.outcome);
            }
        }
    }

    public mapGestureInteractionByName = new Map<string, IBrimboriumGestureInteraction>();
    public mapGestureInteractionByType = new Map<string, IBrimboriumGestureInteraction>();

    public registerInteraction(
        interaction: IBrimboriumGestureInteraction
    ): void {
        this.mapGestureInteractionByName.set(interaction.name, interaction);
        for (const interactionType in interaction.getListSupportedInteractionName()) {
            this.mapGestureInteractionByType.set(interactionType, interaction);
        }
    }

    public getInteraction(
        name: string
    ): IBrimboriumGestureInteraction | undefined {
        return this.mapGestureInteractionByName.get(name);
    }

    public unregisterInteraction(
        name: string
    ): void {
        this.mapGestureInteractionByName.delete(name);
    }

    public getGestureInteractionType(){
        return this.mapGestureInteractionByType.keys();
    }

    processGestureEvent(gestureEvent: BrimboriumGestureEvent) {
        // Process the gesture event through all registered interactions
        for (const [name, interaction] of this.mapGestureInteractionByName) {
            const processed = interaction.process(gestureEvent);
            if (processed) {
                // Interaction handled the event
                // Could break here if we want only one interaction to handle each event
                // For now, let all interactions try to process it
            }
        }
    }

    calcGestureEnabled(
        interactionEnabled: Set<BrimboriumInteractionTypeName> | undefined,
        gestureEnabled: SourceArrayValue<BrimboriumGestureTypeName> | undefined
    ): Set<BrimboriumGestureTypeName> | undefined {

        let result: Set<BrimboriumGestureTypeName> | undefined = undefined;
        if ((interactionEnabled) != null && (0 < interactionEnabled.size)) {
            if (result == null) { result = new Set(); }
            for (const interactionName of interactionEnabled) {
                const interaction = this.mapGestureInteractionByType.get(interactionName);
                if (interaction != null) {
                    const listGesture = interaction.getListNeededGesture(interactionName)
                    for (const gesture of listGesture) {
                        result.add(gesture);
                    }
                }
            }
        }
        const listGestureEnabled = sourceArrayValueAsIteratorLike(gestureEnabled);
        if (listGestureEnabled != null) {
            if (result == null) { result = new Set(); }
            for (const gesture of listGestureEnabled) {
                result.add(gesture)
            }
        }
        return result;
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
