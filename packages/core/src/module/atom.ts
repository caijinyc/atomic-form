import { buildGetAllChildren, buildNode } from '../shared/internal'
import type { AtomType, FormInstance } from '../type/form-type'
import { FormAtomBase } from './base'
import type { FormAtomArray } from './array'

export type ProcessChildValueType<T> = keyof T extends never ? Partial<Exclude<T, void>> : T

export interface FormProps<Value = any> {
  initialValue?: Value
  value?: Value
  path?: string | number
  rootNode?: FormAtomBase
  parentNode?: FormAtomBase
}

export class FormAtom<Value = any, ProcessedValue = ProcessChildValueType<Value>> extends FormAtomBase<Value> {
  children: Record<keyof ProcessedValue, FormAtom> = {} as any

  node<
    Path extends Exclude<keyof ProcessedValue, Symbol>,
  >(path: Path): FormAtom<ProcessedValue[Path]> {
    return buildNode(this, path)
  }

  nodeArray<
    Path extends Exclude<keyof ProcessedValue, Symbol>,
  >(path: Path): FormAtomArray<ProcessedValue[Path]> {
    return buildNode(this, path, 'list') as any
  }

  get allChildren(): FormInstance[] {
    return buildGetAllChildren(this)
  }
}
