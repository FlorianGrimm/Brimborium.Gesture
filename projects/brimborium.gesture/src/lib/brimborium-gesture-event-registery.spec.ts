import { BrimboriumGestureEventRegistery } from './brimborium-gesture-event-registery';

describe('GestureEventRegistery', () => {
  it('should create an instance', () => {
    expect(new BrimboriumGestureEventRegistery(undefined, undefined)).toBeTruthy();
  });

  it('register empty list', () => {
    const fakeEvents = new Set<string>();
    const sut = new BrimboriumGestureEventRegistery((e) => { fakeEvents.add(e) }, (e) => { fakeEvents.delete(e) });
    sut.register([], undefined);
  });

  it('calcDifferences one item', () => {
    const fakeEvents = new Map<string, boolean>();
    const sut = new BrimboriumGestureEventRegistery(
      (e, o) => { fakeEvents.set(e, o); },
      (e) => { fakeEvents.delete(e); });
    const result = sut.calcDifferences([
      { gestureRecognition: "a", eventType: "mousedown", active: true }
    ], undefined);
    expect(sut.mapGestureEventRegisterState.size).toBe(1);
    expect(sut.mapRegisteredEventCondencend.size).toBe(1);
    //sut.addEventListener!("mousedown", {passive:false});
    expect(result).toBeTruthy();
    expect(result?.listToAdd?.length).toBe(1);
  });

  it('calcDifferences one three item', () => {
    const fakeEvents = new Map<string, boolean>();
    const sut = new BrimboriumGestureEventRegistery(
      (e, o) => { fakeEvents.set(e, o); },
      (e) => { fakeEvents.delete(e); });

    {
      const result = sut.calcDifferences([
        { gestureRecognition: "a", eventType: "mousedown", active: false }
      ], undefined);
      expect(sut.mapGestureEventRegisterState.size, "a: sut.mapGestureEventRegisterState.size").toBe(1);
      expect(sut.mapRegisteredEventCondencend.size, "a: sut.mapRegisteredEventCondencend.size").toBe(1);
      
      expect(result).toBeTruthy();
      expect(result?.listToAdd?.length ?? 0).toBe(1);
      expect(result?.listToRemove?.length ?? 0).toBe(0);
    }

    {
      const result = sut.calcDifferences([
        { gestureRecognition: "a", eventType: "mousedown", active: true },
        { gestureRecognition: "a", eventType: "mousemove", active: true },
        { gestureRecognition: "a", eventType: "mouseup", active: true },
      ], undefined);
      expect(sut.mapGestureEventRegisterState.size, "b: sut.mapGestureEventRegisterState.size").toBe(3);
      expect(sut.mapRegisteredEventCondencend.size, "b: sut.mapRegisteredEventCondencend.size").toBe(3);
      
      expect(result).toBeTruthy();
      expect(result?.listToAdd?.length ?? 0, "b: result?.listToAdd?.length").toBe(3);
      expect(result?.listToRemove?.length ?? 0, "b: result?.listToRemove?.length").toBe(1);
    }
  });

  it('calcDifferences one three two item', () => {
    const fakeEvents = new Map<string, boolean>();
    const sut = new BrimboriumGestureEventRegistery(
      (e, o) => { fakeEvents.set(e, o); },
      (e) => { fakeEvents.delete(e); });

    {
      const result = sut.calcDifferences([
        { gestureRecognition: "a", eventType: "mousedown", active: false }
      ], undefined);
      expect(sut.mapGestureEventRegisterState.size, "a: sut.mapGestureEventRegisterState.size").toBe(1);
      expect(sut.mapRegisteredEventCondencend.size, "a: sut.mapRegisteredEventCondencend.size").toBe(1);
      
      expect(result).toBeTruthy();
      expect(result?.listToAdd?.length ?? 0).toBe(1);
      expect(result?.listToRemove?.length ?? 0).toBe(0);
    }

    {
      const result = sut.calcDifferences([
        { gestureRecognition: "a", eventType: "mousedown", active: true },
        { gestureRecognition: "a", eventType: "mousemove", active: true },
        { gestureRecognition: "a", eventType: "mouseup", active: true },
      ], undefined);
      expect(sut.mapGestureEventRegisterState.size, "b: sut.mapGestureEventRegisterState.size").toBe(3);
      expect(sut.mapRegisteredEventCondencend.size, "b: sut.mapRegisteredEventCondencend.size").toBe(3);
      
      expect(result).toBeTruthy();
      expect(result?.listToAdd?.length ?? 0, "b: result?.listToAdd").toBe(3);
      expect(result?.listToRemove?.length ?? 0, "b: result?.listToRemove").toBe(1);
    }
    {
      const result = sut.calcDifferences([
        { gestureRecognition: "a", eventType: "mousedown", active: true },
        { gestureRecognition: "a", eventType: "mouseup", active: true },
      ], undefined);
      expect(sut.mapGestureEventRegisterState.size, "c:sut.mapGestureEventRegisterState.size").toBe(2);
      expect(sut.mapRegisteredEventCondencend.size, "c:sut.mapRegisteredEventCondencend.size").toBe(2);

      expect(result).toBeTruthy();
      expect(result?.listToAdd?.length ?? 0).toBe(0);
      expect(result?.listToRemove?.length ?? 0).toBe(1);
    }
  });

  it('register one item list', () => {
    const fakeEvents = new Map<string, boolean>();
    const sut = new BrimboriumGestureEventRegistery(
      (e, o) => { fakeEvents.set(e, o); },
      (e) => { fakeEvents.delete(e); });
    sut.register([
      { gestureRecognition: "a", eventType: "mousedown", active: true }
    ], undefined);
    expect(Array.from(fakeEvents).map((item) => `${item[0]}:${item[1]}`)).toStrictEqual(["mousedown:true"]);
  });
});
