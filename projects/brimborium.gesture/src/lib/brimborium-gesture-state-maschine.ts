import { BrimboriumGestureRecognitionOutcome, BrimboriumGestureSourceEvent, IBrimboriumGestureRecognition, IBrimboriumGestureEventRegistery, IBrimboriumGestureRoot, IBrimboriumGestureManager } from "./brimborium-gesture-consts";
import type { BrimboriumGestureDefinition } from "./brimborium-gesture-definition";
import type { BrimboriumGestureInteraction } from "./brimborium-gesture-interaction";
import type { BrimboriumGesturePhase } from "./brimborium-gesture-phase";
import type { BrimboriumGestureState } from "./brimborium-gesture-state";
import type { GestureEventRegister, BrimboriumGestureEventRegistery } from "./brimborium-gesture-event-registery";

export class BrimboriumGestureStateMaschine {
    public gestureEventRegistery: IBrimboriumGestureEventRegistery | undefined;

    constructor(public manager:IBrimboriumGestureManager) { 
        
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
            recognition.initialize(this);
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

    onGestureEvent(gestureRoot: IBrimboriumGestureRoot, gestureEvent: BrimboriumGestureSourceEvent): void {
        this.process(gestureEvent);
    }

    process(gestureEvent: BrimboriumGestureSourceEvent) {
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
        //gestureEvent.getGestureAllowed
        this.m
        gestureEvent.nodeRef?.gesture?.gestureAllowed
        for (const [name, recognition] of this.mapGestureRecognition.entries()) {
            if (recognition.readyforInputSourceEvent()) {
                // const prevRecognitionState = recognition.state;
                
                const changed = recognition.process(gestureEvent);
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
        if (resetRecognition) {
            for (const [name, recognition] of this.mapGestureRecognition.entries()) {
                recognition.reset(listFinished);
            }
        }
    }



    public ListStartDefinition: BrimboriumGestureDefinition[] = [];
    registerDefinition(
        definition: BrimboriumGestureDefinition
    ) {
        this.ListStartDefinition.push(definition);
        const listGestureRecognition = definition.getListGestureRecognition();
        if (0 < listGestureRecognition.length) {
            for (const recognition of listGestureRecognition) {
                this.registerRecognition(recognition);
            }
        }

        const listStartPhase = definition.getListStartPhase();
        if (0 < listStartPhase.length) { this.ListCurrentPhase.push(...listStartPhase); }
    }

    public listInteraction: BrimboriumGestureInteraction[] = [];
    registerInteraction(
        interaction: BrimboriumGestureInteraction
    ) {
        this.listInteraction.push(interaction);
    }

    public ListCurrentPhase: BrimboriumGesturePhase[] = [];
    public ListCurrentState: BrimboriumGestureState[] = [];


}
