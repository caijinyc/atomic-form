import { shallowReactive } from '@vue/reactivity'
import { clone, isArr } from '@atomic-form/shared'
import type { ElemOf, ExcludeVoidType } from '../type/util'
import type { WatchOptions } from '../watch'
import { watch } from '../watch'
import { buildGetAllChildren, buildNode, spliceArrayChildren } from '../shared/internal'
import type { AtomType, IForm } from '../type/form-type'
import type { FormAtom, FormProps } from './atom'
import { FormAtomBase } from './base'

export class FormAtomArray<
  Value = any,
  ListItem = ElemOf<ExcludeVoidType<Value>>,
  // Array 中获取到的值可能会为 undefined
  ProcessedListItem = ListItem | undefined,
> extends FormAtomBase<Value> {
  children: Array<FormAtomArray | FormAtom>

  constructor(props: FormProps) {
    super(props)
    this.children = shallowReactive([])

    watch(() => this.value.value, (newValue) => {
      if (isArr(newValue)) {
        const valueLen = newValue.length
        const childrenLen = this.children.length
        if (this.children.length !== valueLen) {
          if (valueLen > childrenLen) {
            // add missing children
            spliceArrayChildren(
              this,
              valueLen,
              0,
              ...newValue.slice(childrenLen).map(v => ({ value: v })),
            )
          }
          else {
            // remove extra children
            spliceArrayChildren(this, valueLen, childrenLen)
          }
        }
      }
    }, { immediate: true })
  }

  watchChildren(cb: (val: Array<IForm>) => void, options?: WatchOptions) {
    return watch(
      () => this.children.map(fc => fc.uuid),
      () => {
        cb(this.children)
      },
      options,
    )
  }

  node(path: number): FormAtom<ProcessedListItem> {
    return buildNode(this, path)
  }

  nodeArray(path: number): FormAtomArray<ProcessedListItem> {
    return buildNode(this, path, 'list')
  }

  get allChildren(): IForm[] {
    return buildGetAllChildren(this)
  }

  splice(startIndex: number, deleteCount: number, ...items: ProcessedListItem[]) {
    const clonedItems: ProcessedListItem[] = clone(items) || []
    spliceArrayChildren(this, startIndex, deleteCount, ...clonedItems.map(v => ({ value: v })))
    const value = clone(this.value.value) || []
    value.splice(startIndex, deleteCount, ...items)
    this.setState(
      {
        value,
      },
    )
    return this
  }
}
