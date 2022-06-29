import { isArray } from '@atomic-form/shared'
import type { FormProps } from '../module/atom'
import { FormAtom, FormAtomArray } from '../module'

/**
 * help use easy to create a form without need to use `new FormAtom`
 *
 * Record: Root Form now support create array form. Great Job!!!
 * @param props
 */
export const createForm: <Value,
  /**
   * When Generics `Value` is used to decide the type of Response,
   * the FormValueType will be wrong.
   * e.g.
   *  createForm<Boolean> will res FormAtom<true, true> | FormAtom<false, false>
   *  but we need res should be FormAtom<Boolean>
   * so we need `SavedValue` to replace `Value` in Response
   */
  SavedValue = Value>(
  props: Omit<FormProps<Value>, 'initialValue'> & { initialValue: Value }
) => Value extends Array<any> ? FormAtomArray<SavedValue> : FormAtom<SavedValue>
  = (props) => {
    return isArray(props.initialValue) ? new FormAtomArray(props) : new FormAtom(props) as any
  }
