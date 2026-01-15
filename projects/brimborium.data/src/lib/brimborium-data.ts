import {
  effect,
  EffectRef,
  Injectable,
  isSignal,
  isWritableSignal,
  OnDestroy,
  OnInit,
  Signal,
  untracked,
  WritableSignal
} from '@angular/core';

import {
  BehaviorSubject,
  InteropObservable,
  Subscribable,
  Subscription,
  Unsubscribable
} from 'rxjs';

// import { Duration, ZonedDateTime } from '@js-joda/core';


/** for logging */
export type ObjectIdentifier = {
  /** object class name */
  readonly objectName: string;
  /** unique number */
  readonly objectIndex: number;
  /** fullName to avoid concat each time */
  readonly fullName: string;
}

/** for logging */
export type ObjectPropertyIdentity = {
  /** object class name */
  readonly objectName: string;
  /** unique number */
  readonly objectIndex: number;

  /** property name */
  readonly propertyName: string;
  /** unique number */
  readonly propertyIndex: number;

  /** fullName to avoid concat each time */
  readonly fullName: string;
}

/** for logging */
export type AnyIdentitfier = {
  /** object class name */
  readonly objectName?: string;
  /** unique number */
  readonly objectIndex?: number;

  /** property name */
  readonly propertyName?: string;
  /** unique number */
  readonly propertyIndex?: number;

  /** fullName to avoid concat each time */
  readonly fullName: string;
};

/* for logging */
export enum ReportLogLevel { trace, info, warn, error, disabled };
export type ReportFN<V> = ((logLevel: ReportLogLevel, sender: AnyIdentitfier, message: string, logicalTime: number, value: V) => void);
export type ReportErrorFN = ((logLevel: ReportLogLevel, sender: AnyIdentitfier, classMethod: string, error: unknown) => void);
export type ReportConvertLogValueFN<V = any> = (value: V, maxLevel: number) => any;
export type ReportConvertObjectLogValueFN<V = any> = (value: V, maxLevel: number) => ({ converted: true, result: any } | { converted: false, result?: undefined });
export type LogEntry = {
  logLevel: ReportLogLevel;
  sender: AnyIdentitfier,
  logicalTime: number;
  message: string;
  value: any;
};

/**
 * factory for BrimboriumDataObject (and the related properties).
 */
@Injectable({
  providedIn: 'root',
})
export class BrimboriumDataService {
  public readonly depIdentityService = new BrimboriumIdentityService();
  public readonly objectIdentifier: ObjectIdentifier;
  public readonly mapReportConvertLogValue = new Map<string, ReportConvertLogValueFN>();
  public readonly listReportConvertLogValue: ReportConvertObjectLogValueFN[] = [];

  constructor() {
    this.objectIdentifier = this.depIdentityService.createDataServiceIdentity();
    this.mapReportConvertLogValue.set("Number", (value: number, maxLevel: number) => value)
    this.mapReportConvertLogValue.set("String", (value: string, maxLevel: number) => value)
    this.mapReportConvertLogValue.set("Boolean", (value: any[], maxLevel: number) => value)
    this.mapReportConvertLogValue.set("Date", (value: any[], maxLevel: number) => value)
    this.mapReportConvertLogValue.set("Array", (value: any[], maxLevel: number) => value.length)

    // this.mapReportConvertLogValue.set("ZonedDateTime", (value: ZonedDateTime, maxLevel: number) => value.toString())
    // this.mapReportConvertLogValue.set("Duration", (value: Duration, maxLevel: number) => value.toString())
  }

  /**
   * 
   * @param that 
   * @returns 
   */
  public wrap(
    that: BrimboriumDataTargetObject
  ): BrimboriumDataObject {
    return new BrimboriumDataObject(that, this, this.depIdentityService);
  }

  private haltMessage: string | undefined = undefined;

  /**
   * halt everything
   * @param message 
   */
  halt(message: string) {
    this.haltMessage = message;
  }

  /**
   * throw if halt was called before.
   */
  throwIfHalted() {
    if (this.haltMessage != null) { throw new Error(this.haltMessage); }
  }

  /** active scopes */
  listScopes: BrimboriumDataServiceExecutionScope[] = [];

  /**
   * start a scope
   * @returns the new scope
   */
  startScope(): BrimboriumDataServiceExecutionScope {
    this.throwIfHalted();

    const result = new BrimboriumDataServiceExecutionScope(this, this.depIdentityService);
    this.listScopes.push(result);
    this.log(ReportLogLevel.trace, result.objectIdentifier, "startScope", result.scopeIndex, undefined);
    return result;
  }

  /**
   * remove the scope
   * @param scope 
   */
  removeScope(scope: BrimboriumDataServiceExecutionScope) {
    const listScopesLength = this.listScopes.length;
    if (0 < listScopesLength) {
      const foundScope = this.listScopes[listScopesLength - 1];
      if (Object.is(scope, foundScope)) {
        this.listScopes.splice(listScopesLength - 1, 1);
        this.log(ReportLogLevel.trace, scope.objectIdentifier, "removeScope:last", scope.scopeIndex, { index: listScopesLength - 1 });
        return;
      }
    }
    {
      const foundIndex = this.listScopes.findIndex(item => Object.is(item, scope));
      if (0 <= foundIndex) {
        this.listScopes.splice(foundIndex, 1);
        this.log(ReportLogLevel.trace, scope.objectIdentifier, "removeScope:inner", scope.scopeIndex, { index: foundIndex });
        return;
      }
    }

    this.log(ReportLogLevel.trace, scope.objectIdentifier, "removeScope:not found", scope.scopeIndex, undefined);
  }

  /** the current minimum logLevel */
  public logLevel: ReportLogLevel = ReportLogLevel.disabled;

  /** custom callback for onReport. */
  public loggerFN: ReportFN<any> | undefined;

  /** calls the custom callback for onReport or the default one. */
  public log<V>(logLevel: ReportLogLevel, sender: { fullName: string }, message: string, logicalTime: number, value: V) {
    if (this.loggerFN) {
      if (ReportLogLevel.disabled === logLevel) { return; }
      if (logLevel < this.logLevel) { return; }
      this.loggerFN(logLevel, sender, message, logicalTime, value);
    } else {
      if (ReportLogLevel.disabled === logLevel) { return; }
      if (logLevel < this.logLevel) { return; }
      // TODO: generalize/enable customize
      let fnLog: ((...data: any[]) => void);
      switch (logLevel) {
        case ReportLogLevel.error: fnLog = console.error; break;
        case ReportLogLevel.info: fnLog = console.info; break;
        case ReportLogLevel.warn: fnLog = console.warn; break;
        case ReportLogLevel.trace: fnLog = console.trace; break;
        default: fnLog = console.log; break;
      }
      const logValue = this.convertLogValue(value, 2);
      fnLog(sender.fullName, message, logicalTime, logValue);
    }
  }

  /**
   * conver a value to a log-able/printable value.
   * @param value to convert
   * @param maxlevel avoid endless recursion
   * @returns a reduced/printable value
   */
  convertLogValue<V>(value: V, maxlevel: number): any {
    if (value == null) { return value; }
    if (Array.isArray(value)) { return value.length; }
    switch (typeof value) {
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string': return value;
      case 'symbol': return value.toString();
      case 'function': return value.name;
      default: break;
    }
    if ('object' === typeof value) {
      const constructorName = value.constructor.name;

      if (maxlevel <= 0) {
        return constructorName;
      } else {
        if ('Object' === constructorName) {
          for (const convertFN of this.listReportConvertLogValue) {
            const { converted, result } = convertFN(value, maxlevel - 1);
            if (converted) { return result; }
          }
        } else {
          const convertFN = this.mapReportConvertLogValue.get(constructorName);
          if (convertFN != null) { return convertFN(value, maxlevel - 1); }
        }

        {
          const result: any = {};
          let keyWatchdog = 10;
          for (const key in value) {
            const valueC = this.convertLogValue(value[key], maxlevel - 1);
            if (valueC != null) {
              result[key] = valueC;
              if ((keyWatchdog--) <= 0) {
                return result;
              }
            }
          }
          return result;
        }
      }
    }
    return value;
  }


  /** custom callback for onReportError. */
  public reportError: ReportErrorFN | undefined;

  /** calls the custom callback for onReportError or the default one. */
  public onReportError(logLevel: ReportLogLevel, that: any, classMethod: string, error: unknown) {
    if (this.reportError) {
      this.reportError(logLevel, that, classMethod, error);
    } else {
      console.error(classMethod, error);
    }
  }

  private _isLoggingEnabled: boolean = false;
  public get isLoggingEnabled(): boolean {
    return this._isLoggingEnabled;
  }
  public set isLoggingEnabled(value: boolean) {
    this._isLoggingEnabled = value;
  }

  /** a list of LogEntry */
  ListLog: LogEntry[] = [];

  /**
   * add to the logEntry 
   * @param logEntry to add
   */
  addLog(logEntry: LogEntry) {
    if (!this._isLoggingEnabled) { return; }
    if (1000 < this.ListLog.length) {
      this.ListLog.splice(0, 500);
    }
    this.ListLog.push(logEntry);
    // console.log({ ...logEntry.objectPropertyIdentity, ...logEntry });
  }

  /**
   * wire the loggerFn to ListLog.
   * @param logLevel the minimal logLevel
   */
  setupLoggerFnToListLog(
    logLevel: ReportLogLevel | undefined
  ) {
    if (undefined === logLevel) {
    } else {
      this.logLevel = logLevel;
    }
    this.loggerFN = ((logLevel: ReportLogLevel, sender: AnyIdentitfier, message: string, logicalTime: number, value: any) => {
      this.ListLog.push({ logLevel: logLevel, sender: sender, message: message, logicalTime: logicalTime, value: value });
    });
  }
}

/**
 * produce unique identifiers (number).
 */
export class BrimboriumIdentityService {
  private static _DataServiceIndex = 1;
  public nextDataServiceIndex() {
    return BrimboriumIdentityService._DataServiceIndex++;
  }

  /**
   * for the BrimboriumDataService
   */
  createDataServiceIdentity(): ObjectIdentifier {
    const objectIndex = this.nextDataServiceIndex();
    const result: ObjectIdentifier = Object.freeze({
      fullName: `BrimboriumDataService-${objectIndex}`,
      objectName: 'BrimboriumDataService',
      objectIndex: objectIndex,
    });
    return result;
  }

  private _ObjectIndex = 1;
  /**
   * the next unique Object identifier - used by createObjectIdentity
   */
  public nextObjectIndex() {
    return this._ObjectIndex++;
  }

  /**
   * create a new identifier for a object
   * @param name 
   */
  createObjectIdentity(name: string): ObjectIdentifier {
    const objectIndex = this.nextObjectIndex();
    const result: ObjectIdentifier = Object.freeze({
      fullName: `${name}-${objectIndex}`,
      objectName: name,
      objectIndex: objectIndex,
    });
    return result;
  }

  private _PropertyIndex = 1;

  /**
   * the next unique property identifier - used by createPropertyIdentity
   */
  public nextPropertyIndex() {
    return this._PropertyIndex++;
  }

  /**
   * create a identifier for a property
   * @param objectIdentifier 
   * @param name 
   * @returns 
   */
  createPropertyIdentity(objectIdentifier: ObjectIdentifier, name: string): ObjectPropertyIdentity {
    const propertyIndex = this.nextPropertyIndex();
    const result: ObjectPropertyIdentity = Object.freeze({
      fullName: `${objectIdentifier.fullName}-${name}-${propertyIndex}`,
      objectName: objectIdentifier.objectName,
      objectIndex: objectIdentifier.objectIndex,
      propertyName: name,
      propertyIndex: propertyIndex,
    });
    return result;
  }

  private _ScopeIndex = 1;
  /**
   * the next unique scope identifier used by createScopeIdentity
   */
  public nextScopeIndex() {
    return this._ScopeIndex++;
  }

  /**
   * 
   * @param objectIndex 
   * @returns 
   */
  createScopeIdentity(objectIndex?: number): ObjectIdentifier {
    if (objectIndex == null) {
      objectIndex = this.nextScopeIndex();
    }
    const result: ObjectIdentifier = Object.freeze({
      fullName: `scope-${objectIndex}`,
      objectName: "scope",
      objectIndex: objectIndex,
    });
    return result;
  }
}

/**
 * the wrapped object
 */
export type BrimboriumDataTargetObject
  = Partial<OnDestroy>
  & Partial<OnInit>
  & Partial<{
    /**
     * 
     */
    dataPropertyInitializer: BrimboriumDataObject;
    /**
     * the wrapped object
     */
    subscription: Subscription;
  }>;

export type BrimboriumDataPropertyBaseArgument<V> = {
  /** the property name for logging */
  name?: string;
  /** equality check - to stop dependency and effects */
  equal?: (a: V, b: V) => boolean;
};

export type BrimboriumDataPropertyValueArgument<V> = BrimboriumDataPropertyBaseArgument<V>
  & {
    /** the initial value */
    initialValue: V;
  };

export type BrimboriumDataPropertyWrapSignalArgument<V> = BrimboriumDataPropertyBaseArgument<V>
  & {};


/**
 * factory for property
 * created by BrimboriumDataService.wrap
 */
export class BrimboriumDataObject implements Unsubscribable {
  public readonly objectIdentifier: ObjectIdentifier;
  public readonly brimboriumDataService: BrimboriumDataService;
  public readonly brimboriumIdentityService: BrimboriumIdentityService
  public readonly subscription: Subscription;

  constructor(
    that: BrimboriumDataTargetObject,
    brimboriumDataService: BrimboriumDataService,
    brimboriumIdentityService: BrimboriumIdentityService
  ) {
    this.objectIdentifier = brimboriumIdentityService.createObjectIdentity(that.constructor.name);
    this.brimboriumDataService = brimboriumDataService;
    this.brimboriumIdentityService = brimboriumIdentityService;
    this.subscription = that.subscription ?? new Subscription();
    if (that.ngOnInit == null) {
      that.ngOnInit = () => {
        this.initialize();
      };
    }
    if (that.ngOnDestroy == null) {
      that.ngOnDestroy = () => {
        this.destroy();
      };
    }
    this.subscription.add(this);
  }

  destroy(): void {
    this.subscription.unsubscribe();
  }

  unsubscribe(): void {
    // HERE
    this._closed = true;
  }
  private _closed: boolean = false;
  public get closed(): boolean { return this._closed; }

  public createProperty<V>(
    args: BrimboriumDataPropertyValueArgument<V>
  ): BrimboriumDataPropertyValue<V> {
    const result = new BrimboriumDataPropertyValue<V>(args, this, this.brimboriumIdentityService);

    if (this.listDataPropertyInitilizer == null) {
      this.listDataPropertyInitilizer = [];
    }
    this.listDataPropertyInitilizer.push(result);

    return result;
  }

  public createPropertyWrapSignal<V>(
    signal: Signal<V>,
    args?: BrimboriumDataPropertyWrapSignalArgument<V> | undefined
  ): BrimboriumDataPropertyWrapSignal<V> {
    const result = new BrimboriumDataPropertyWrapSignal<V>(signal, args, this, this.brimboriumIdentityService);

    if (this.listDataPropertyInitilizer == null) {
      this.listDataPropertyInitilizer = [];
      window.requestAnimationFrame(() => { this.ensureInitializeIsCalled(); });
    }
    this.listDataPropertyInitilizer.push(result);

    return result;
  }

  public createPropertyWrapWritableSignal<V>(
    signal: WritableSignal<V>,
    args?: BrimboriumDataPropertyWrapSignalArgument<V> | undefined
  ): BrimboriumDataPropertyWrapWritableSignal<V> {
    const result = new BrimboriumDataPropertyWrapWritableSignal<V>(signal, args, this, this.brimboriumIdentityService);

    if (this.listDataPropertyInitilizer == null) {
      this.listDataPropertyInitilizer = [];
      window.requestAnimationFrame(() => { this.ensureInitializeIsCalled(); });
    }
    this.listDataPropertyInitilizer.push(result);

    return result;
  }

  public listDataPropertyInitilizer: (IBrimboriumDataPropertyInitilizer[] | undefined) = undefined;

  public initialize() {
    const listDataPropertyInitilizer = this.listDataPropertyInitilizer;
    this.listDataPropertyInitilizer = undefined;
    if (listDataPropertyInitilizer != null) {
      const scope = this.brimboriumDataService.startScope();
      for (const dataPropertyInitilizer of listDataPropertyInitilizer) {
        dataPropertyInitilizer.initilize(scope);
      }
      scope.commit();
    }
  }

  private ensureInitializeIsCalled() {
    if (this.listDataPropertyInitilizer == null) {
      const message = `${this.objectIdentifier.fullName} initialize() is not called.`;
      this.brimboriumDataService.halt(message);
      throw new Error(message);
    }
  }
}

export type BrimboriumDataSourceValue<V> = IBrimboriumDataProperty<V> | Signal<V>;

export type BrimboriumDataPropertySourceDependency<TS> = {
  [name in keyof TS]: BrimboriumDataSourceValue<TS[name]>;
};
export type BrimboriumDataPropertySourceDependencyProperty<TS> = {
  [name in keyof TS]: IBrimboriumDataProperty<TS[name]>;
};

export type BrimboriumDataPropertySourceValue<TS> = {
  [name in keyof TS]: TS[name];
};

export type BrimboriumDataPropertySourceTransform<TS, V> = (value: BrimboriumDataPropertySourceValue<TS>, currentValue: V, scope: BrimboriumDataServiceExecutionScope) => V;
export type BrimboriumDataSourceArguments<TS, V> = {
  sourceDependency: BrimboriumDataPropertySourceDependency<TS>;
  sourceTransform: BrimboriumDataPropertySourceTransform<TS, V>;
};

export type BrimboriumDataEffectArguments<V> = {
  sideEffect: (value: V) => void;
  animationFrame?: boolean;
}

export interface IBrimboriumDataProperty<V> {
  readonly objectPropertyIdentifier: ObjectPropertyIdentity;

  getValue(): V;
  setValue(value: V, scope?: BrimboriumDataServiceExecutionScope): void;

  addDependencySource(source: IBrimboriumDataDependencySource): void;
  removeDependencySource(source: IBrimboriumDataDependencySource): void;

  setDirty(): boolean;
  getDirtyWeight(maxlevel: number): number;
  resetDirty(): void;
};

export interface IBrimboriumDataPropertyInitilizer {
  initilize(scope: BrimboriumDataServiceExecutionScope): void;
};

export interface IBrimboriumDataSideEffect {
  execute(): void;
}

export class BrimboriumDataPropertyBase<V> implements IBrimboriumDataProperty<V>, IBrimboriumDataPropertyInitilizer, Unsubscribable, InteropObservable<V> {
  readonly objectPropertyIdentifier: ObjectPropertyIdentity;
  readonly equal: (a: V, b: V) => boolean;
  readonly depThis: BrimboriumDataObject;
  readonly brimboriumDataService: BrimboriumDataService;
  valueVersion: number;

  constructor(
    args: BrimboriumDataPropertyBaseArgument<V> | undefined,
    dataObject: BrimboriumDataObject,
    brimboriumIdentityService: BrimboriumIdentityService
  ) {
    this.objectPropertyIdentifier = brimboriumIdentityService.createPropertyIdentity(dataObject.objectIdentifier, args?.name ?? '');
    this.equal = args?.equal ?? Object.is;
    this.brimboriumDataService = dataObject.brimboriumDataService;
    this.valueVersion = 0;
    this.depThis = dataObject;
    dataObject.subscription.add(this);
  }

  initilize(scope: BrimboriumDataServiceExecutionScope): void {
    if (this.listDependencySink != null) {
      for (const dep of this.listDependencySink) {
        dep.initilize(scope)
      }
    }
  }

  unsubscribe(): void {
    if (this.listDependencySink != null) {
      for (const dep of this.listDependencySink) {
        dep.destroy();
      }
    }
    if (this.listDependencySource != null) {
      if (0 < this.listDependencySource.length) {
        this.brimboriumDataService.log(ReportLogLevel.warn, this.objectPropertyIdentifier, "after unsubscribe remaining listDependencySource", 0, { listDependencySource: this.listDependencySource.length });
      }
    }
    this._closed = true;
  }

  private _closed: boolean = false;
  public get closed(): boolean {
    return this._closed;
  }

  // this is the source
  public listDependencySource: (IBrimboriumDataDependencySource[] | undefined) = undefined;

  // this is the sink
  public listDependencySink: (IBrimboriumDataDependencySink<V>[] | undefined) = undefined;

  // the effects after setValue
  public listEffect: (IBrimboriumDataSideEffect[] | undefined) = undefined;

  withSource<TS>(args: BrimboriumDataSourceArguments<TS, V>): this {
    const dataSource = new BrimboriumDataDependency<V, TS>(
      args,
      this,
      this.depThis
    );
    if (this.listDependencySink == null) {
      this.listDependencySink = [dataSource];
    } else {
      this.listDependencySink.push(dataSource);
    }
    return this;
  }

  withSideEffect(
    args: BrimboriumDataEffectArguments<V>
  ): this {
    const dataSource = new BrimboriumDataEffect<V>(args, this);
    if (this.listEffect == null) {
      this.listEffect = [dataSource];
    } else {
      this.listEffect.push(dataSource);
    }
    return this;
  }

  addDependencySource(source: IBrimboriumDataDependencySource): void {
    if (this.listDependencySource == null) {
      this.listDependencySource = [source];
    } else {
      this.listDependencySource.push(source);
    }
  }

  removeDependencySource(source: IBrimboriumDataDependencySource): void {
    if (this.listDependencySource != null) {
      const index = this.listDependencySource.findIndex(item => Object.is(item, source));
      if (0 <= index) {
        this.listDependencySource.splice(index, 1);
      }
    }
  }

  isDirty: boolean = false;
  setDirty(): boolean {
    if (this.isDirty) {
      return false;
    } else {
      this.isDirty = true;
      return true;
    }
  }

  getDirtyWeight(maxlevel: number): number {
    if (this.isDirty) {
      if (this.listDependencySource == null) {
        return 0;
      } else {
        let result = 1;
        if (0 < maxlevel) {
          for (const dep of this.listDependencySource) {
            result += dep.getDirtyWeight(maxlevel - 1);
          }
        }
        return result;
      }
    } else {
      return -1;
    }
  }

  resetDirty() {
    let nextIsDirty = false;
    if (this.listDependencySink != null) {
      for (const dep of this.listDependencySink) {
        if (dep.getDirtyWeight(0) <= 0) {
          // clean
        } else {
          nextIsDirty = true;
        }
      }
    }
    this.isDirty = nextIsDirty;
  }

  getValue(): V {
    throw new Error("BrimboriumDataPropertyBase.getValue is abstract");
  }
  setValue(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    throw new Error("BrimboriumDataPropertyBase.setValue is abstract");
  }

  [Symbol.observable](): Subscribable<V> {
    return this.asObserable();
  }
  private _subscribable: BrimboriumDataServiceSubject<V> | undefined;
  asObserable(): BehaviorSubject<V> {
    let subject = this._subscribable;
    if (subject != null) {
      return subject;
    }
    subject = new BrimboriumDataServiceSubject<V>(this, this.getValue());
    this._subscribable = subject;
    if (this.listEffect == null) {
      this.listEffect = [subject];
    } else {
      this.listEffect.push(subject);
    }
    return subject;
  }
}

export class BrimboriumDataPropertyValue<V> extends BrimboriumDataPropertyBase<V> {
  public value: V;

  constructor(
    args: BrimboriumDataPropertyValueArgument<V>,
    depThis: BrimboriumDataObject,
    depIdentityService: BrimboriumIdentityService
  ) {
    super(args, depThis, depIdentityService);
    this.value = args.initialValue;
  }

  override getValue(): V {
    return this.value;
  }

  override setValue(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    if (this.equal(value, this.value)) {
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyValue.setValue: equal quick exit", scope?.scopeIndex ?? 0, { value: value });
      return;
    } else {
      const listDataDependencySource = this.listDependencySource;
      const listEffect = this.listEffect

      if ((0 === (listDataDependencySource?.length ?? 0))
        && (0 === (listEffect?.length ?? 0))
      ) {
        const scopeIndex = (scope?.scopeIndex) ?? (this.depThis.brimboriumIdentityService.nextScopeIndex());
        this.valueVersion = scopeIndex;
        this.value = value;
      } else {
        const transaction = scope ?? this.brimboriumDataService.startScope();
        this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyValue.setValue: set value", transaction.scopeIndex, { value: value });
        this.valueVersion = transaction.scopeIndex;
        this.value = value;

        if (listDataDependencySource != null) {
          for (const dataSource of listDataDependencySource) {
            dataSource.notifyValueChanged(transaction);
          }
        }

        if (listEffect != null) {
          for (const effect of listEffect) {
            transaction.addEffect(effect);
          }
        }

        if (scope == null) {
          this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyValue.setValue: commit-ing", transaction.scopeIndex, { value: value });
          transaction.commit();
        }
      }
    }
  }
}

export class BrimboriumDataPropertyWrapSignal<V> extends BrimboriumDataPropertyBase<V> {
  signal: Signal<V>;
  value: V;
  private effectRef: EffectRef | undefined;
  constructor(
    signal: Signal<V>,
    args: BrimboriumDataPropertyWrapSignalArgument<V> | undefined,
    depThis: BrimboriumDataObject,
    depIdentityService: BrimboriumIdentityService
  ) {
    super(args, depThis, depIdentityService);
    this.signal = signal;
    {
      let valueS: V = undefined as any;
      untracked(() => { valueS = signal(); });
      this.value = valueS;
    }

    this.effectRef = effect(() => {
      const valueS = signal();
      const scope = this._setValueScope;
      if (scope == null) {
        if (this.equal(this.value, valueS)) {
          this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from signal: equal quick exit", 0, { value: valueS });
          return;
        } else {
          this.value = valueS;
          this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from signal", 0, { value: valueS });
          this.setValueFromSignal(valueS, scope);
        }
      } else {
        this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from setValue", scope.scopeIndex, { value: valueS });
        this._setValueScope = undefined;
      }
    });
  }

  override unsubscribe(): void {
    this.effectRef?.destroy();
    this.effectRef = undefined;
    super.unsubscribe();
  }

  override getValue(): V {
    return this.value;
  }

  override setValue(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    if (this.equal(this.value, value)) {
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValue: equal quick exit", scope?.scopeIndex ?? 0, { value: value });
      return;
    } else {
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValue to signal", scope?.scopeIndex ?? 0, { value: value });
      this.setValueFromSignal(value, scope);
    }
  }


  private _setValueScope: BrimboriumDataServiceExecutionScope | undefined;
  private setValueFromSignal(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    const listDataDependencySource = this.listDependencySource;
    const listEffect = this.listEffect

    if ((0 === (listDataDependencySource?.length ?? 0))
      && (0 === (listEffect?.length ?? 0))
    ) {
      const scopeIndex = (scope?.scopeIndex) ?? (this.depThis.brimboriumIdentityService.nextScopeIndex());
      this.valueVersion = scopeIndex;
      this.value = value;
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: set value - with DependencySource", scopeIndex, { value: value });
    } else {
      const transaction = scope ?? this.brimboriumDataService.startScope();
      this.valueVersion = transaction.scopeIndex;
      this.value = value;
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: set value - with DependencySource", transaction.scopeIndex, { value: value });

      if (listDataDependencySource != null) {
        for (const dataSource of listDataDependencySource) {
          dataSource.notifyValueChanged(transaction);
        }
      }

      if (listEffect != null) {
        for (const effect of listEffect) {
          transaction.addEffect(effect);
        }
      }

      if (scope == null) {
        this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: commit-ing", transaction.scopeIndex, { value: value });
        transaction.commit();
      }
    }
  }
}

export class BrimboriumDataPropertyWrapWritableSignal<V> extends BrimboriumDataPropertyBase<V> {
  signal: WritableSignal<V>;
  value: V;
  private effectRef: EffectRef | undefined;
  constructor(
    signal: WritableSignal<V>,
    args: BrimboriumDataPropertyWrapSignalArgument<V> | undefined,
    depThis: BrimboriumDataObject,
    depIdentityService: BrimboriumIdentityService
  ) {
    super(args, depThis, depIdentityService);
    this.signal = signal;
    {
      let valueS: V = undefined as any;
      untracked(() => { valueS = signal(); });
      this.value = valueS;
    }

    this.effectRef = effect(() => {
      const valueS = signal();
      const scope = this._setValueScope;
      if (scope == null) {
        if (this.equal(this.value, valueS)) {
          this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from signal: equal quick exit", 0, { value: valueS });
          return;
        } else {
          this.value = valueS;
          this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from signal", 0, { value: valueS });
          this.setValueFromSignal(valueS, scope);
        }
      } else {
        this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.effect from setValue", scope.scopeIndex, { value: valueS });
        this._setValueScope = undefined;
      }
    });
  }

  override unsubscribe(): void {
    this.effectRef?.destroy();
    this.effectRef = undefined;
    super.unsubscribe();
  }

  override getValue(): V {
    return this.value;
  }

  override setValue(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    if (this.equal(this.value, value)) {
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValue: equal quick exit", scope?.scopeIndex ?? 0, { value: value });
      return;
    } else {
      const transaction = scope ?? this.brimboriumDataService.startScope();
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValue to signal", transaction.scopeIndex, { value: value });
      this._setValueScope = transaction;
      this.signal.set(value);
      if (this._setValueScope == null) {
        // should not be as I understand...
      } else {
        this.setValueFromSignal(value, scope);
        //this._setValueScope = undefined;
      }
      if (scope == null) {
        transaction.commit();
      }
    }
  }

  private _setValueScope: BrimboriumDataServiceExecutionScope | undefined;
  private setValueFromSignal(value: V, scope?: BrimboriumDataServiceExecutionScope): void {
    const listDataDependencySource = this.listDependencySource;
    const listEffect = this.listEffect

    if ((0 === (listDataDependencySource?.length ?? 0))
      && (0 === (listEffect?.length ?? 0))
    ) {
      const scopeIndex = (scope?.scopeIndex) ?? (this.depThis.brimboriumIdentityService.nextScopeIndex());
      this.valueVersion = scopeIndex;
      this.value = value;
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: set value - with DependencySource", scopeIndex, { value: value });
    } else {
      const transaction = scope ?? this.brimboriumDataService.startScope();
      this.valueVersion = transaction.scopeIndex;
      this.value = value;
      this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: set value - with DependencySource", transaction.scopeIndex, { value: value });

      if (listDataDependencySource != null) {
        for (const dataSource of listDataDependencySource) {
          dataSource.notifyValueChanged(transaction);
        }
      }

      if (listEffect != null) {
        for (const effect of listEffect) {
          transaction.addEffect(effect);
        }
      }

      if (scope == null) {
        this.brimboriumDataService.log(ReportLogLevel.trace, this.objectPropertyIdentifier, "BrimboriumDataPropertyWrapSignal.setValueFromSignal: commit-ing", transaction.scopeIndex, { value: value });
        transaction.commit();
      }
    }
  }
}


export interface IBrimboriumDataDependencySource {
  setDependencyDirty(): boolean;
  notifyValueChanged(scope: BrimboriumDataServiceExecutionScope): void;
  getDirtyWeight(maxlevel: number): number;
}

export interface IBrimboriumDataDependencySink<V> {
  initilize(scope: BrimboriumDataServiceExecutionScope): void;
  destroy(): void;
  getDirtyWeight(maxlevel: number): number;
}

export interface IBrimboriumDataDependencyCleanup {
  getDirtyWeight(maxlevel: number): number;
  cleanup(scope: BrimboriumDataServiceExecutionScope): void;
}

export class BrimboriumDataDependency<V, TS> implements IBrimboriumDataDependencySink<V>, IBrimboriumDataDependencySource, IBrimboriumDataDependencyCleanup {
  sourceDependency: BrimboriumDataPropertySourceDependencyProperty<TS>;
  sourceTransform: BrimboriumDataPropertySourceTransform<TS, V>;

  constructor(
    args: BrimboriumDataSourceArguments<TS, V>,
    public targetProperty: IBrimboriumDataProperty<V>,
    public depThis: BrimboriumDataObject
  ) {
    const sourceDependency: BrimboriumDataPropertySourceDependencyProperty<TS> = {} as any;
    for (const key in args.sourceDependency) {
      const dep = args.sourceDependency[key];
      if (isWritableSignal(dep)) {
        const depSignal = dep as WritableSignal<TS[typeof key]>;
        const dataProperty = this.depThis.createPropertyWrapWritableSignal(depSignal, {
          name: `${this.targetProperty.objectPropertyIdentifier.fullName}-${key}`
        })
        sourceDependency[key] = dataProperty;
      } else if (isSignal(dep)) {
        const depSignal = dep as Signal<TS[typeof key]>;
        const dataProperty = this.depThis.createPropertyWrapSignal(depSignal, {
          name: `${this.targetProperty.objectPropertyIdentifier.fullName}-${key}`
        })
        sourceDependency[key] = dataProperty;
      } else if ("function" === typeof dep.getValue) {
        const dataProperty = dep as IBrimboriumDataProperty<TS[typeof key]>;
        sourceDependency[key] = dataProperty;
      } else {
        throw new Error(`unexpected ${dep}`);
      }
    }
    this.sourceDependency = sourceDependency;
    this.sourceTransform = args.sourceTransform;
  }

  initilize(scope: BrimboriumDataServiceExecutionScope): void {
    for (const key in this.sourceDependency) {
      const depProp = this.sourceDependency[key];
      depProp.addDependencySource(this);
    }
    this.cleanup(scope);
  }

  destroy() {
    for (const key in this.sourceDependency) {
      const dep = this.sourceDependency[key];
      dep.removeDependencySource(this);
    }
  }

  notifyValueChanged(scope: BrimboriumDataServiceExecutionScope): void {
    this.targetProperty.setDirty();
    const keysLength = Object.keys(this.sourceDependency).length;
    if (1 === keysLength) {
      this.setDependencyDirty();
      this.cleanup(scope);
      return;
    } else {
      if (this.setDependencyDirty()) {
        scope.addCleanup(this);
      }
    }
  }

  isDependencyDirty: boolean = false;
  setDependencyDirty(): boolean {
    if (this.isDependencyDirty) {
      return false;
    } else {
      this.isDependencyDirty = true;
      return true;
    }
  }
  getDirtyWeight(maxlevel: number): number {
    if (this.isDependencyDirty) {
      let result = 1;
      if (0 < maxlevel) {
        for (const key in this.sourceDependency) {
          const dep = this.sourceDependency[key];
          result += dep.getDirtyWeight(maxlevel - 1);
        }
      }
      return result;
    } else {
      return -1;
    }
  }

  cleanup(scope: BrimboriumDataServiceExecutionScope): void {
    const sourceValue: BrimboriumDataPropertySourceValue<TS> = {} as any;
    for (const key in this.sourceDependency) {
      const dep = this.sourceDependency[key];
      sourceValue[key] = dep.getValue();
    }
    const currentValue = this.targetProperty.getValue();
    const nextValue = this.sourceTransform(sourceValue, currentValue, scope);
    this.targetProperty.setValue(nextValue, scope)
    this.isDependencyDirty = false;
    this.targetProperty.resetDirty();
  }
}

export class BrimboriumDataEffect<V> implements IBrimboriumDataSideEffect {
  sideEffect: (value: V) => void;
  readonly depProperty: IBrimboriumDataProperty<V>;
  readonly animationFrame: boolean;
  constructor(
    args: BrimboriumDataEffectArguments<V>,
    depProperty: IBrimboriumDataProperty<V>
  ) {
    this.sideEffect = args.sideEffect;
    this.animationFrame = args.animationFrame ?? false;
    this.depProperty = depProperty;
  }

  execute(): void {
    if (this.animationFrame) {
      window.requestAnimationFrame(() => {
        const value = this.depProperty.getValue();
        this.sideEffect(value);
      });
    } else {
      const value = this.depProperty.getValue();
      this.sideEffect(value);
    }
  }
}

export class BrimboriumDataServiceSubject<V> extends BehaviorSubject<V> implements IBrimboriumDataSideEffect {
  constructor(
    public property: BrimboriumDataPropertyBase<V>,
    value: V
  ) {
    super(value);
  }

  override next(value: V): void {
    this.property.setValue(value);
  }

  execute(): void {
    const valueP = this.property.getValue();
    super.next(valueP);
  }
}

/**
 * collect the dependecies as IBrimboriumDataDependencyCleanup and effects 
 */
export class BrimboriumDataServiceExecutionScope {
  scopeIndex: number;
  readonly objectIdentifier: ObjectIdentifier;

  /**
   * 
   * @param dataService 
   * @param depIndexService 
   */
  constructor(
    public dataService: BrimboriumDataService,
    private depIndexService: BrimboriumIdentityService
  ) {
    this.scopeIndex = depIndexService.nextScopeIndex();
    this.objectIdentifier = this.depIndexService.createScopeIdentity(this.scopeIndex);
  }

  /** run the added cleanups/dependecy-properties and effects */
  commit() {
    this.dataService.log(ReportLogLevel.trace, this.objectIdentifier, "commit", this.scopeIndex, this.listCleanup?.length);

    // 1) handle cleanups aka handle the dependencies.
    if (this.listCleanup != null) {
      while (0 < this.listCleanup.length) {
        const cleanup = this.getNextCleanup();
        if (cleanup == null) { continue; }
        cleanup.cleanup(this);
      }
    }

    // 2) handle the effects.
    if (this.listEffect != null) {
      const listEffect = this.listEffect;
      this.listEffect = undefined;
      for (const effect of listEffect) {
        effect.execute();
      }
    }

    // 3) remove the scopes.
    this.dataService.removeScope(this);
  }


  listCleanup: (IBrimboriumDataDependencyCleanup[] | undefined) = undefined;
  addCleanup(todo: IBrimboriumDataDependencyCleanup) {
    if (this.listCleanup == null) {
      this.listCleanup = [todo];
    } else {
      this.listCleanup.push(todo);
    }
  }

  getNextCleanup() {
    if (this.listCleanup == null) { return undefined; }
    if (0 === this.listCleanup.length) { return undefined; }
    if (1 === this.listCleanup.length) { return this.listCleanup.pop(); }
    let index = 0;
    let nextIndex = 0;
    let nextDirtyWeight = -1;
    while (index < this.listCleanup.length) {
      const cleanup = this.listCleanup[index];
      const dirtyWeight = cleanup.getDirtyWeight(2);
      if (dirtyWeight < 0) {
        this.listCleanup.splice(index, 1);
        return cleanup;
      }
      if (nextDirtyWeight == -1) {
        nextDirtyWeight = dirtyWeight;
        nextIndex = index;
        index++;
        continue;
      }
      if (dirtyWeight < nextDirtyWeight) {
        nextDirtyWeight = dirtyWeight;
        nextIndex = index;
        index++;
        continue;
      }
      {
        index++;
        continue;
      }
    }
    if (0 <= nextIndex && nextIndex < this.listCleanup.length) {
      const cleanup = this.listCleanup.splice(nextIndex, 1)[0];
      return cleanup;
    }

    return this.listCleanup.pop();
  }

  listEffect: (IBrimboriumDataSideEffect[] | undefined) = undefined;
  addEffect(effect: IBrimboriumDataSideEffect) {
    if (this.listEffect == null) {
      this.listEffect = [effect];
    } else {
      this.listEffect.push(effect)
    }
  }
}
