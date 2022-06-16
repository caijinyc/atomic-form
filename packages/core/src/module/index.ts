import { isArr } from '@atomic-form/shared'
import type { FormProps } from './atom'
import { FormAtom } from './atom'
import { FormAtomArray } from './array'
export { FormAtom } from './atom'

/**
 * Record: Root Form now support create array form. Great Job!!!
 * @param props
 */
export const createForm: <Value>(props: FormProps<Value>) => Value extends Array<any> ? FormAtomArray<Value> : FormAtom<Value> = (props) => {
  return isArr(props.initialValue) ? new FormAtomArray(props) : new FormAtom(props) as any
}
