import { shallowReactive } from '@vue/reactivity'
import { clone, isArray } from '@atomic-form/shared'
import type { ElemOf, ExcludeVoidType } from '../type/util'
import type { WatchOptions } from '../watch'
import { watch } from '../watch'
import { buildGetAllChildren, buildNode } from '../shared'
import type { FormInstance } from '../type'
import { processFromAndToIndex, resetFormArrayChildrenAddress, spliceArrayChildren } from '../shared/array-util'
import type { FormAtom, FormProps } from './atom'
import { FormAtomBase } from './base'

export class FormAtomArray<
  V = any,
  ItemValue = ElemOf<ExcludeVoidType<V>>,
  // Array 中获取到的值可能会为 undefined
  ProcessedItemValue = ItemValue | undefined,
> extends FormAtomBase<V> {
  children: Array<FormAtomArray | FormAtom>

  constructor(props: FormProps) {
    super(props)
    this.children = shallowReactive([])

    watch(() => this.state.value, (newValue) => {
      if (isArray(newValue)) {
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

  watchChildren(cb: (val: Array<FormInstance>) => void, options?: WatchOptions) {
    return watch(
      () => this.children.map(fc => fc.uuid),
      () => {
        cb(this.children)
      },
      options,
    )
  }

  node(path: number): FormAtom<ProcessedItemValue> {
    return buildNode(this, path)
  }

  nodeArray(path: number): FormAtomArray<ProcessedItemValue> {
    return buildNode(this, path, 'list')
  }

  get allChildren(): FormInstance[] {
    return buildGetAllChildren(this)
  }

  splice(startIndex: number, deleteCount: number, ...items: ProcessedItemValue[]) {
    const clonedItems: ProcessedItemValue[] = clone(items) || []
    spliceArrayChildren(this, startIndex, deleteCount, ...clonedItems.map(v => ({ value: v })))
    const value = clone(this.state.value) || []
    value.splice(startIndex, deleteCount, ...items)
    this.setState(
      {
        value,
      },
    )
    return this
  }

  push(...itemsValue: ProcessedItemValue[]) {
    return this.splice(this.children.length, 0, ...itemsValue)
  }

  insert(startIndex: number, ...items: ProcessedItemValue[]) {
    return this.splice(startIndex, 0, ...items)
  }

  remove(startIndex: number, removeCount?: number) {
    return this.splice(startIndex, removeCount || 1)
  }

  move(fromIndex: number, toIndex: number) {
    const value = clone(this.state.value) || []
    const { from, to } = processFromAndToIndex(value, fromIndex, toIndex)

    const formNode = this.children[fromIndex]
    this.children[fromIndex] = this.children[toIndex]
    this.children[toIndex] = formNode
    resetFormArrayChildrenAddress(this)
    const [v] = value.splice(from, 1)
    value.splice(to, 0, v)
    this.setState(
      {
        value,
      },
    )
    return this
  }
}
