export type OrUndefined<V> = V | undefined;
export type OrNullUndefined<V> = V | null | undefined;
export type EqualFn<V> = (a: V, b: V) => boolean;
