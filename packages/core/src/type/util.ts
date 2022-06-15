export type ElemOf<T> = T extends (infer Elem)[] ? Elem : never
export type ExcludeVoidType<T> = Exclude<T, void>
