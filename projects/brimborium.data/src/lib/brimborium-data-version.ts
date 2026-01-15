import { EqualFn } from "./brimborium-data-types";

export type BrimboriumValueVersionOneOf<V> = BrimboriumValueVersion<V> | BrimboriumDataVersion<V>;
export type BrimboriumValueVersionAny<V> = BrimboriumValueVersionOneOf<V> | (() => BrimboriumValueVersionOneOf<V>);

export type BrimboriumValueVersionChangedFn<V> = (that: V) => void;
export type CalculateFn<V> = (that: V) => void;

export type BrimboriumValueWithVersion<V> = {
    value: V;
    version: number;
}

export type BrimboriumValueVersion<V> = {
    value: V;
    version?: number | undefined;
    equal?: EqualFn<V> | undefined;
    listChanged?: BrimboriumValueVersionChangedFn<BrimboriumValueVersion<V>>[] | undefined;
}

/**
 * Get the value
 * @param that any (BrimboriumValueVersion / BrimboriumDataVersion)
 * @returns the value
 */
export function getValueVersionValue<V>(that: BrimboriumValueVersionAny<V>): V {
    const thatValue = ("function" === typeof (that)) ? that() : that;
    if (thatValue instanceof BrimboriumDataVersion) {
        return thatValue.getValue();
    } else {
        return thatValue.value;
    }
}

/**
 * get the value and version
 * @param that any
 * @returns the value and version - may be the orignal BrimboriumValueVersion / BrimboriumDataVersion may me not
 */
export function getValueAndVersion<V>(that: BrimboriumValueVersionAny<V>): BrimboriumValueWithVersion<V> {
    const thatValue = ("function" === typeof (that)) ? that() : that;
    if (thatValue instanceof BrimboriumDataVersion) {
        return thatValue.getValueVersion();
    } else {
        if (thatValue.version == null) {
            thatValue.version = 0;
        }
        return thatValue as BrimboriumValueWithVersion<V>;
    }
}

/**
 * set the value and increase the version
 * @param that value and versopn
 * @param value the new value
 * @param equal equal function (optionaö)
 * @returns 
 */
export function setValueVersion<V>(that: BrimboriumValueVersion<V>, value: V, equal?: EqualFn<V>): boolean {
    if (that instanceof BrimboriumDataVersion) {
        return that.setValue(value);
    } else {
        const eq: EqualFn<V> = equal ?? that.equal ?? Object.is;
        if (eq(that.value, value)) {
            return false;
        } else {
            that.value = value;
            that.version = (that.version ?? 0) + 1;
            if (that.listChanged != null) {
                for (const cbChanged of that.listChanged) {
                    cbChanged(that);
                }
            }
            return true;
        }
    }
}

/**
 * add changed callback
 * @param that target 
 * @param cbChanged callback
 */
export function addValueVersionChanged<V>(that: BrimboriumValueVersionAny<V>, cbChanged: BrimboriumValueVersionChangedFn<BrimboriumValueVersionOneOf<V>>) {
    const thatValue = ("function" === typeof (that)) ? that() : that;
    if (thatValue instanceof BrimboriumDataVersion) {
        thatValue.addChanged(cbChanged);
    } else {
        (thatValue.listChanged ??= []).push(cbChanged);
    }
}

export function accessorValueVersion<V>(that: BrimboriumValueVersion<V>) {
    return () => { return that };
}

export class BrimboriumDataVersion<V> {
    value: V;
    version: number;
    equal: EqualFn<V>;
    listChanged?: BrimboriumValueVersionChangedFn<BrimboriumDataVersion<V>>[] | undefined;
    calculate?: CalculateFn<BrimboriumDataVersion<V>> | undefined;

    constructor(
        value: V,
        version?: number,
        equal?: EqualFn<V>
    ) {
        this.value = value;
        this.version = version ?? 0;
        this.equal = equal ?? Object.is;
    }

    getValue(): V {
        if (this.calculate != null) {
            this.calculate(this);
        }
        return this.value;
    }

    getValueVersion(): BrimboriumValueWithVersion<V> {
        if (this.calculate != null) {
            this.calculate(this);
        }
        return this;
    }

    setValue(value: V): boolean {
        const eq: EqualFn<V> = this.equal ?? Object.is;
        if (eq(this.value, value)) {
            return false;
        } else {
            this.value = value;
            this.version = (this.version ?? 0) + 1;
            if (this.listChanged != null) {
                for (const cbChanged of this.listChanged) {
                    cbChanged(this);
                }
            }
            return true;
        }
    }

    addChanged(cbChanged: BrimboriumValueVersionChangedFn<BrimboriumDataVersion<V>>) {
        (this.listChanged ??= []).push(cbChanged);
    }


    setImmediateCalculation2<T extends { [p in keyof (T)]: T[p] }>(
        deps: T,
        fn: (
            v: { [p in keyof (T)]: BrimboriumValueVersionAny<T[p]> },
            that: this
        ) => void
    ) {
        const depsVersion: { [p in keyof (T)]: { value: T[p], version: number } } = {} as any;

        const calculationFn = () => {
            let changed = false;
            for (const n in deps) {
                const current = getValueAndVersion(deps[n]);
                if (depsVersion[n].version === current.version) {
                    // no change
                } else {
                    depsVersion[n] = { value: current.value, version: current.version } as any;
                    changed = true;
                }
            }
            if (changed) {
                fn(depsVersion, this)
            }
        };

        for (const n in deps) {
            const current = getValueAndVersion(deps[n]);
            depsVersion[n] = { value: current.value, version: current.version } as any;
            addValueVersionChanged(deps[n], calculationFn);
        }
    }


    setImmediateCalculation<T extends { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? BrimboriumDataVersion<A> : never }>(
        deps: T,
        fn: (
            v: { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? { value: A, version: number } : never },
            that: this
        ) => void
    ) {
        const depsVersion: { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? { value: A, version: number } : never } = {} as any;

        const calculationFn = () => {
            let changed = false;
            for (const n in deps) {
                const current = deps[n].getValueVersion();
                if (depsVersion[n].version === current.version) {
                    // no change
                } else {
                    depsVersion[n] = { value: current.value, version: current.version } as any;
                    changed = true;
                }
            }
            if (changed) {
                fn(depsVersion, this)
            }
        };

        for (const n in deps) {
            const current = deps[n].getValueVersion() as BrimboriumDataVersion<any>;
            depsVersion[n] = { value: current.value, version: current.version } as any;
            deps[n].addChanged(calculationFn);
        }
    }

    setLazyCalculation<T extends { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? BrimboriumDataVersion<A> : never }>(
        deps: T,
        fn: (
            v: { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? { value: A, version: number } : never },
            that: this
        ) => void
    ): void {
        const depsVersion: { [p in keyof (T)]: T[p] extends BrimboriumDataVersion<infer A> ? { value: A, version: number } : never } = {} as any;
        for (const n in deps) {
            const current = deps[n].getValueVersion();
            depsVersion[n] = { value: current.value, version: current.version } as any;
        }

        const result: CalculateFn<BrimboriumDataVersion<V>> = (that: BrimboriumDataVersion<V>) => {
            let changed = false;
            for (const n in deps) {
                const current = deps[n].getValueVersion();
                if (depsVersion[n].version === current.version) {
                    // no change
                } else {
                    depsVersion[n] = { value: current.value, version: current.version } as any;
                    changed = true;
                }
            }
            if (changed) {
                fn(depsVersion, this)
            }
        };
        this.calculate = result;
    }


    private _accessor: (() => this) | undefined;
    accessor() {
        return this._accessor ??= (() => { return this; });
    }
}
