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

    private isProcessingEnabled: boolean = true;

    public suspend(): void {
        this.isProcessingEnabled = false;
    }

    public resume(): void {
        this.isProcessingEnabled = true;
        this.processList();
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

        if (this.isProcessingEnabled) {
            this.processItem(item);
        } else {
            (this.list ??= []).push(item);
        }
        return true;
    }
}
