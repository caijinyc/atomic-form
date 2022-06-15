import { shallowReactive } from '@vue/reactivity'
import { isArr } from '@atomic-form/shared'
import type { ElemOf, ExcludeVoidType } from '../type/util'
import { watch } from '../watch'
import type { FormAtom, FormProps } from './atom'
import { FormAtomBase } from './atom'

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

    // watch(
    //   () => this.value.value,
    //   (newValue) => {
    //     if (isArr(newValue)) {
    //       const childrenLength = this.children.length
    //       const valLength = newValue.length
    //       if (childrenLength !== valLength) {
    //         if (valLength > childrenLength) {
    //           spliceArrayChildren(
    //             this,
    //             valLength,
    //             0,
    //             ...newValue.slice(childrenLength).map(v => ({ value: v })),
    //           )
    //         }
    //         else {
    //           // remove extra children
    //           spliceArrayChildren(this, valLength, childrenLength)
    //         }
    //       }
    //     }
    //   },
    //   { immediate: true },
    // )
  }
}
