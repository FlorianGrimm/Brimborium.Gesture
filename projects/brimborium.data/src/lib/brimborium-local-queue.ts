export type ProcessItemFn<T> = (item: T) => void;
export type PredicateAddFn<T> = (item: T, that: BrimboriumLocalQueue<T>) => boolean;

export class BrimboriumLocalQueue<T> {
    public list: T[] | undefined;
    constructor(
        private processItem: ProcessItemFn<T>,
        private predicate: PredicateAddFn<T> | undefined
    ) {
        this.list = undefined;
    }

    private _isProcessingEnabled: boolean = true;
    private _listLock: number[] = [];
    private _nextLock: number = 1;
    public suspend(): number {
        this._isProcessingEnabled = false;
        const result = this._nextLock++
        this._listLock.push(result);
        return result
    }

    public resume(lock: number): boolean | undefined {
        const index = this._listLock.indexOf(lock);
        if (0 <= index) {
            this._listLock.splice(index, 1);
            if (0 === this._listLock.length) {
                this._isProcessingEnabled = true;
                this.processList();
                return true;
            } else {
                return false;
            }
        } else {
            return undefined;
        }
    }

    public transaction(fn:Function){
        const lock = this.suspend();
        try{
            fn();
        } finally{
            this.resume(lock);
        }
    }

    private processList(): void {
        if ((this.list != null) && (0 < this.list.length)) {
            const list = this.list;
            this.list = undefined;

            for (const item of list) {
                this.processItem(item);
            }
        }
    }

    public add(item: T) {
        if (this.predicate != null) {
            if (this.predicate(item, this)) {
                // add
            } else {
                return false;
            }
        }

        if (this._isProcessingEnabled) {
            this.processItem(item);
        } else {
            (this.list ??= []).push(item);
        }
        return true;
    }
}
