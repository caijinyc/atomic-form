import { buildGetAllChildren, buildNode } from '../shared/internal'
import type { AtomType, IForm } from '../type/form-type'
import { FormAtomBase } from './base'

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
    Type extends AtomType = 'normal',
  >(path: Path, type?: Type): Type extends 'list' ? FormAtom<ProcessedValue[Path]> : FormAtom<ProcessedValue[Path]> {
    return buildNode(this, path, type)
  }

  get allChildren(): IForm[] {
    return buildGetAllChildren(this)
  }
}
