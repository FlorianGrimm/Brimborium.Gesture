import { GestureSourceEventName, IBrimboriumGestureEventRegistery } from "./brimborium-gesture-consts";

export type GestureEventRegister = {
    gestureRecognition: string;
    eventType: GestureSourceEventName;
    active: boolean;
}

type GestureEventRegisterState = {
    gestureId: string;
    gestureRecognition: string;
    eventType: GestureSourceEventName;
    gestureActive: boolean;
    gestureVisited: boolean;
    condencend: RegisteredEventCondencend;
}

type RegisteredEventCondencend = {
    eventType: GestureSourceEventName;
    eventActive: boolean;
    eventRegistered: boolean;
    eventVisitedActive: boolean;
    eventVisited: boolean;
}

export type AddRemoveEventListenerFN = ((type: string, active: boolean) => void);
export class BrimboriumGestureEventRegistery implements IBrimboriumGestureEventRegistery {
    constructor(
        addEventListener: (undefined | AddRemoveEventListenerFN),
        removeEventListener: (undefined | AddRemoveEventListenerFN)
    ) {
        this.addEventListener = addEventListener;
        this.removeEventListener = removeEventListener;
    }

    readonly mapGestureEventRegisterState = new Map<string, GestureEventRegisterState>();
    readonly mapRegisteredEventCondencend = new Map<GestureSourceEventName, RegisteredEventCondencend>();

    public register(listEventRegister: GestureEventRegister[], gestureRecognition: string | undefined): void {
        const diff = this.calcDifferences(listEventRegister, gestureRecognition);
        if (diff != null) {
            if (diff.listToRemove != null) {
                for (const item of diff.listToRemove) {
                    if (this.removeEventListener != null) {
                        this.removeEventListener(item.eventType, item.eventActive);
                    }
                    window.document.removeEventListener
                    item.eventRegistered = false;
                }
            }
            if (diff.listToAdd != null) {
                for (const item of diff.listToAdd) {
                    if (this.addEventListener != null) {
                        this.addEventListener(item.eventType, item.eventActive);
                    }
                    item.eventRegistered = true;
                }
            }
        }
    }

    addEventListener: (undefined | AddRemoveEventListenerFN) = undefined;
    removeEventListener: (undefined | AddRemoveEventListenerFN) = undefined;

    public calcDifferences(listEventRegister: GestureEventRegister[], gestureRecognition: string | undefined) {
        let countFoundState: number;
        if (gestureRecognition == null) {
            countFoundState = -this.mapRegisteredEventCondencend.size;
            this.mapGestureEventRegisterState.forEach((item) => { item.gestureVisited = false; });
        } else {
            countFoundState = 0;
            this.mapGestureEventRegisterState.forEach((item) => {
                if (gestureRecognition === item.gestureRecognition) {
                    countFoundState++;
                    item.gestureVisited = false;
                }
            });
        }
        let dirty = false;
        for (const eventRegister of listEventRegister) {
            const id = `${eventRegister.gestureRecognition}-${eventRegister.eventType}`;
            let gestureEventRegistered = this.mapGestureEventRegisterState.get(id);
            let registeredEventCondencend = this.mapRegisteredEventCondencend.get(eventRegister.eventType);
            if (registeredEventCondencend == null) {
                registeredEventCondencend = {
                    eventType: eventRegister.eventType,
                    eventActive: eventRegister.active,
                    eventRegistered: false,
                    eventVisitedActive: eventRegister.active,
                    eventVisited: true
                };
                this.mapRegisteredEventCondencend.set(eventRegister.eventType, registeredEventCondencend);
                dirty = true;
            }
            if (gestureEventRegistered == null) {
                gestureEventRegistered = {
                    gestureId: id,
                    gestureRecognition: eventRegister.gestureRecognition,
                    eventType: eventRegister.eventType,
                    gestureActive: eventRegister.active,
                    gestureVisited: true,
                    condencend: registeredEventCondencend
                };
                this.mapGestureEventRegisterState.set(id, gestureEventRegistered);
                dirty = true;
            } else {
                gestureEventRegistered.gestureVisited = true;
                if (gestureEventRegistered.gestureActive != eventRegister.active) {
                    gestureEventRegistered.gestureActive = eventRegister.active;
                    dirty = true;
                }
                countFoundState++;
            }
        }

        if (countFoundState !== 0 || dirty) {
            let listGestureEventRegisterStateRemove: string[] | undefined = undefined;
            for (const [name, registeredEventCondencend] of this.mapRegisteredEventCondencend) {
                registeredEventCondencend.eventVisitedActive = false;
                registeredEventCondencend.eventVisited = false;
            }
            for (const [name, gestureEventRegistered] of this.mapGestureEventRegisterState) {
                if (gestureEventRegistered.gestureVisited) {
                    gestureEventRegistered.condencend.eventVisited = true;
                    if (gestureEventRegistered.gestureActive) {
                        gestureEventRegistered.condencend.eventVisitedActive = true;
                    }
                } else {
                    (listGestureEventRegisterStateRemove ??= []).push(gestureEventRegistered.gestureId);
                }
            }
            let listRegisteredEventCondencendRemove: GestureSourceEventName[] | undefined = undefined;
            let listToRemove: (RegisteredEventCondencend[] | undefined) = undefined;
            let listToAdd: (RegisteredEventCondencend[] | undefined) = undefined;
            for (const [name, state] of this.mapRegisteredEventCondencend) {
                if (state.eventRegistered) {
                    if (state.eventVisited) {
                        if (state.eventVisitedActive == state.eventActive) {
                            // ok
                        } else {
                            (listToRemove ??= []).push(state);
                            (listToAdd ??= []).push(state);
                            state.eventActive = state.eventVisitedActive;
                        }
                    } else {
                        (listToRemove ??= []).push(state);
                        state.eventRegistered = false;
                        (listRegisteredEventCondencendRemove ??= []).push(name);
                    }
                } else {
                    if (state.eventVisited) {
                        (listToAdd ??= []).push(state);
                        state.eventRegistered = true;
                        state.eventActive = state.eventVisitedActive;
                    } else {
                        // not registered and not visited ... strange
                        (listRegisteredEventCondencendRemove ??= []).push(name);
                    }
                }
            }
            if (listGestureEventRegisterStateRemove != null) {
                for (const name of listGestureEventRegisterStateRemove) {
                    this.mapGestureEventRegisterState.delete(name);
                }
            }
            if (listRegisteredEventCondencendRemove != null) {
                for (const name of listRegisteredEventCondencendRemove) {
                    this.mapRegisteredEventCondencend.delete(name);
                }
            }
            if (listToAdd != null || listToRemove != null) {
                return { listToAdd, listToRemove };
            }
        }
        return undefined
    }
}
