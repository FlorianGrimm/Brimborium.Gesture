import { ZonedDateTime, Duration } from '@js-joda/core';
import { AnyIdentitfier, BrimboriumDataService, LogEntry, ReportFN, ReportLogLevel } from './brimborium-data';
import { Subscription } from 'rxjs';
import { computed, effect, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';

function createWithinContext<V>(injector: EnvironmentInjector, fn: () => V): V {
  let result: V = undefined! as any;
  runInInjectionContext(injector, () => {
    result = fn();
  });
  return result;
}

describe('BrimboriumDataService', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrimboriumDataService]
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('log trace', () => {
    const dataService = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.trace);
      return dataService
    });
    dataService.ListLog.length = 0;
    dataService.log(ReportLogLevel.disabled, { fullName: "" }, "disabled", 0, undefined);
    dataService.log(ReportLogLevel.trace, { fullName: "" }, "trace", 0, undefined);
    dataService.log(ReportLogLevel.info, { fullName: "" }, "info", 0, undefined);
    dataService.log(ReportLogLevel.warn, { fullName: "" }, "warn", 0, undefined);
    dataService.log(ReportLogLevel.error, { fullName: "" }, "error", 0, undefined);
    expect(dataService.ListLog).toHaveLength(4);
  });

  it('log info', () => {
    const dataService = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.info);
      return dataService
    });
    dataService.ListLog.length = 0;
    dataService.log(ReportLogLevel.disabled, { fullName: "" }, "disabled", 0, undefined);
    dataService.log(ReportLogLevel.trace, { fullName: "" }, "trace", 0, undefined);
    dataService.log(ReportLogLevel.info, { fullName: "" }, "info", 0, undefined);
    dataService.log(ReportLogLevel.warn, { fullName: "" }, "warn", 0, undefined);
    dataService.log(ReportLogLevel.error, { fullName: "" }, "error", 0, undefined);
    expect(dataService.ListLog).toHaveLength(3);
  });

  it('log error', () => {
    const dataService = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.error);
      return dataService
    });
    dataService.ListLog.length = 0;
    dataService.log(ReportLogLevel.disabled, { fullName: "" }, "disabled", 0, undefined);
    dataService.log(ReportLogLevel.trace, { fullName: "" }, "trace", 0, undefined);
    dataService.log(ReportLogLevel.info, { fullName: "" }, "info", 0, undefined);
    dataService.log(ReportLogLevel.warn, { fullName: "" }, "warn", 0, undefined);
    dataService.log(ReportLogLevel.error, { fullName: "" }, "error", 0, undefined);
    expect(dataService.ListLog).toHaveLength(1);
  });


  it('log disabled', () => {
    const dataService = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.disabled);
      return dataService
    });
    dataService.ListLog.length = 0;
    dataService.log(ReportLogLevel.disabled, { fullName: "" }, "disabled", 0, undefined);
    dataService.log(ReportLogLevel.trace, { fullName: "" }, "trace", 0, undefined);
    dataService.log(ReportLogLevel.info, { fullName: "" }, "info", 0, undefined);
    dataService.log(ReportLogLevel.warn, { fullName: "" }, "warn", 0, undefined);
    dataService.log(ReportLogLevel.error, { fullName: "" }, "error", 0, undefined);
    expect(dataService.ListLog).toHaveLength(0);
  });

  it('get and set', () => {
    runInInjectionContext(injector, () => {
      const dataService = inject(BrimboriumDataService);

      const objectA = {
        subscription: new Subscription()
      };
      const depThisA = dataService.wrap(objectA);
      const propertyA = depThisA.createProperty<number>({
        name: "propertyA",
        initialValue: 1
      });
      expect(depThisA.listDataPropertyInitilizer?.length).toBe(1);
      depThisA.initialize();

      expect(propertyA.getValue()).toBe(1);

      propertyA.setValue(2);
      expect(propertyA.getValue()).toBe(2);


      const objectB = {
        subscription: new Subscription()
      };
      const depThisB = dataService.wrap(objectB);
      const propertyB = depThisB.createProperty<number>({
        name: "propertyB",
        initialValue: 1
      }).withSource({
        sourceDependency: { propA: propertyA },
        sourceTransform: ({ propA }) => 1 + 2 * propA
      });
      expect(depThisB.listDataPropertyInitilizer?.length).toBe(1);
      expect(propertyB.getValue()).toBe(1);
      expect(propertyB.listDependencySource, "propertyB.listDependencySource").toBe(undefined);
      expect(propertyB.listDependencySink?.length, "propertyB.listDependencySink").toBe(1);

      depThisB.initialize();
      expect(depThisB.listDataPropertyInitilizer).toBe(undefined);

      expect(propertyA.listDependencySink, "propertyA.listDependencySink").toBe(undefined);
      expect(propertyA.listDependencySource?.length, "propertyA.listDependencySource").toBe(1);

      expect(propertyB.getValue()).toBe(1 + 2 * 2);



      const objectC = {
        subscription: new Subscription()
      };
      const depThisC = dataService.wrap(objectC);
      const propertyC = depThisC.createProperty<number>({
        name: "propertyC",
        initialValue: 1
      }).withSource({
        sourceDependency: { propA: propertyA, propB: propertyB },
        sourceTransform: ({ propA, propB }) => propB + 2 * propA
      });
      depThisC.initialize();
      expect(propertyC.getValue()).toBe(9);

      const scope = dataService.startScope();
      propertyA.setValue(3, scope);
      expect(propertyC.isDirty, "propertyC.isDirty").toBe(true);
      scope.commit();
      expect(propertyC.getValue()).toBe(13);

      expect(propertyA.listDependencySource?.length).toBe(2);
      expect(propertyB.listDependencySource?.length).toBe(1);
      objectC.subscription.unsubscribe();

      expect(propertyA.listDependencySource?.length).toBe(1);
      expect(propertyB.listDependencySource?.length).toBe(0);

      objectB.subscription.unsubscribe();
      objectA.subscription.unsubscribe();
    });
  });

  it('effect', () => {
    runInInjectionContext(injector, () => {
      const dataService = inject(BrimboriumDataService);

      const objectA = {
        sideEffect: 0,
        subscription: new Subscription()
      };
      const depThisA = dataService.wrap(objectA);
      const propertyA = depThisA.createProperty<number>({
        name: "propertyA",
        initialValue: 1
      }).withSideEffect({
        sideEffect: (value) => {
          objectA.sideEffect = value;
        },
      });
      depThisA.initialize();
      expect(objectA.sideEffect, 'objectA.sideEffect').toBe(0);

      const objectB = {
        sideEffect: 0,
        subscription: new Subscription()
      };
      const depThisB = dataService.wrap(objectB);
      const propertyB = depThisB.createProperty<number>({
        name: "propertyB",
        initialValue: 1
      }).withSource({
        sourceDependency: { propA: propertyA },
        sourceTransform: ({ propA }) => 1 + 2 * propA
      }).withSideEffect({
        sideEffect: (value) => {
          objectB.sideEffect = value;
        },
      });
      depThisB.initialize();

      expect(objectA.sideEffect, 'objectA.sideEffect').toBe(0);
      expect(objectB.sideEffect, 'objectB.sideEffect').toBe(3);

      propertyA.setValue(2);
      expect(propertyB.getValue(), 'propertyB.getValue()').toBe(5);
      expect(objectA.sideEffect, 'objectA.sideEffect').toBe(2);
      expect(objectB.sideEffect, 'objectB.sideEffect').toBe(5);
    });
  });

  it('convertLogValue', () => {
    runInInjectionContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      expect(dataService).toBeDefined();

      dataService.mapReportConvertLogValue.set("ZonedDateTime", (value: ZonedDateTime, maxLevel: number) => value.toString())
      dataService.mapReportConvertLogValue.set("Duration", (value: Duration, maxLevel: number) => value.toString())

      expect(dataService.convertLogValue(0, 1)).toBe(0);
      expect(dataService.convertLogValue(1, 1)).toBe(1);
      expect(dataService.convertLogValue("abc", 1)).toBe("abc");
      expect(dataService.convertLogValue(true, 1)).toBe(true);
      expect(dataService.convertLogValue([], 1)).toBe(0);
      expect(dataService.convertLogValue({ a: [] }, 1)).toStrictEqual({ a: 0 });
      expect(dataService.convertLogValue({ a: [1, 1, 1, 1, 1] }, 1)).toStrictEqual({ a: 5 });
      expect(dataService.convertLogValue(ZonedDateTime.parse("2025-12-29T04:20:23.154+01:00"), 1)).toBe("2025-12-29T04:20:23.154+01:00");
    });
  });
  it('effect flush', () => {
    const { $signal, sideEffect } = createWithinContext(injector, () => {
      const $signal = signal<number>(1);
      const sideEffect: {
        value: number
      } = {
        value: 0
      };
      const effectRef = effect(() => {
        const valueS = $signal();
        sideEffect.value = valueS;
      });
      return { $signal, sideEffect };
    });
    expect($signal()).toBe(1);
    expect(sideEffect.value).toBe(0);
    $signal.set(2);
    expect($signal()).toBe(2);
    expect(sideEffect.value).toBe(0);
    TestBed.tick();
    expect($signal()).toBe(2);
    expect(sideEffect.value).toBe(2);
  });
  it('signal', () => {
    const dataService = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.trace);
      return dataService
    });

    const { objectA, propertyA, $signalB, $signalB2, propertyB } = createWithinContext(injector, () => {
      const dataService = inject(BrimboriumDataService);
      dataService.setupLoggerFnToListLog(ReportLogLevel.trace);

      expect(dataService).toBeDefined();

      const objectA = {
        sideEffect: 0,
        subscription: new Subscription()
      };
      const depThisA = dataService.wrap(objectA);
      const propertyA = depThisA.createProperty<number>({
        name: "propertyA",
        initialValue: 1
      }).withSideEffect({
        sideEffect: (value) => {
          objectA.sideEffect = value;
        },
      });

      const $signalB = signal<number>(1, { debugName: '$signalB' })
      const $signalB2 = computed(() => {
        return $signalB();
      });
      const propertyB = depThisA.createPropertyWrapSignal(
        $signalB,
        {
          name: '$signalB'
        }
      );
      depThisA.initialize();
      return ({ objectA, propertyA, $signalB, $signalB2, propertyB });
    });
    expect(objectA.sideEffect, 'objectA.sideEffect').toBe(0);

    const { objectC, propertyC } = createWithinContext(injector, () => {
      const objectC = {
        subscription: new Subscription()
      };
      const depThisC = dataService.wrap(objectC);
      const propertyC = depThisC.createProperty<number>({
        name: "propertyC",
        initialValue: 1,
        equal: (a, b) => a === b
      }).withSource({
        sourceDependency: { propA: propertyA, propB: propertyB },
        sourceTransform: ({ propA, propB }) => (propA < propB) ? propB : propA
      }).withSideEffect({
        sideEffect: (value) => { $signalB.set(value); }
      });
      depThisC.initialize();
      return { objectC, propertyC }
    });

    expect(propertyC.getValue()).toBe(1);

    {
      dataService.ListLog.length = 0;
      propertyA.setValue(2);
      expect(propertyA.getValue(), "2: propertyA.getValue()").toBe(2);
      expect(propertyB.getValue(), "2: propertyB.getValue()").toBe(1);
      expect(propertyC.getValue(), "2: propertyC.getValue()").toBe(2);
      expect($signalB(), "2: $signalB()").toBe($signalB2());
    }

    {     
      propertyB.setValue(3);
      expect(propertyA.getValue(), "3: propertyA.getValue()").toBe(2);
      expect(propertyB.getValue(), "3: propertyB.getValue()").toBe(3);
      expect(propertyC.getValue(), "3: propertyC.getValue()").toBe(3);
      expect($signalB(), "3: $signalB()").toBe($signalB2());
      TestBed.tick();
    }

    {
      dataService.ListLog.length = 0;
      $signalB.set(4);
      expect($signalB(), "4a: $signalB()").toBe(4);
      expect(propertyB.getValue(), "4a: propertyB.getValue()").toBe(3);
      TestBed.tick();
      
      expect(propertyA.getValue(), "4b: propertyA.getValue()").toBe(2);
      expect(propertyB.getValue(), "4b: propertyB.getValue()").toBe(4);
      expect(propertyC.getValue(), "4b: propertyC.getValue()").toBe(4);
      expect($signalB(), "4b: $signalB()").toBe(4);
    }

    objectC.subscription.unsubscribe();
    objectA.subscription.unsubscribe();
  });
});
