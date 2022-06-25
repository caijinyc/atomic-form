import { useEffect, useRef } from 'react'
import type { FormAtom, ProcessChildValueType } from '@atomic-form/core/src/module/atom'
import type { ElemOf } from '@atomic-form/core/src/type/util'
import type { FormAtomArray } from '@atomic-form/core'
import { useForceRender } from '../shared/use-force-render'

/**
 * Watch form children's order and length, when change, return new children
 * WARNING: this hook is just for array form, not for other form type
 *
 * @param form
 */
export function useFormList<
  ValueType extends any[],
  ElementValueType = ElemOf<ProcessChildValueType<ValueType>>,
>(
  form: FormAtomArray<ValueType>,
): Array<ElementValueType extends any[] ? FormAtomArray<ElementValueType> : FormAtom<ElementValueType>> {
  const children = useRef(form.children)
  const refresh = useForceRender()

  // TODO validate on change

  useEffect(() => {
    return form.watchChildren(
      (newChildren) => {
        children.current = newChildren
        refresh()
      },
      { immediate: true },
    )
  }, [form.uuid])

  return children.current as any
}
