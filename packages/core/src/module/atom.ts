import { buildGetAllChildren, buildNode } from '../shared'
import type { FormInstance } from '../type'
import { FormAtomBase } from './base'
import type { FormAtomArray } from './array'

export type GetChildValue<T> = keyof T extends never ? Partial<Exclude<T, void>> : T

export interface FormProps<V = any> {
  initialValue?: V
  value?: V
  path?: string | number
  rootNode?: FormAtomBase
  parentNode?: FormAtomBase
}

export class FormAtom<V = any, PV = GetChildValue<V>> extends FormAtomBase<V> {
  children: Record<keyof PV, FormAtom> = {} as any

  node<
    Path extends Exclude<keyof PV, Symbol>,
  >(path: Path): FormAtom<PV[Path]> {
    return buildNode(this, path)
  }

  nodeArray<
    Path extends Exclude<keyof PV, Symbol>,
  >(path: Path): FormAtomArray<PV[Path]> {
    return buildNode(this, path, 'list') as any
  }

  get allChildren(): FormInstance[] {
    return buildGetAllChildren(this)
  }
}
