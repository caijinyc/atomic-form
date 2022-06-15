import { Keys, clone, isFn, nextTick } from '@atomic-form/shared'
import type { FormAtomBase } from '../module'
import type { IFormState, IPartialFormState } from '../type/form-type'

export const buildLazyCallback = (originCb: (...args: any) => any) => {
  let count = 0
  return async(state?: any) => {
    const currentCount = count++
    await nextTick()
    if (currentCount === count - 1) {
      count = 0
      originCb(state)
    }
  }
}

export function buildSetState<V, F extends FormAtomBase>(
  form: F,
  payload: IPartialFormState<V> | ((oldState: IFormState<V>) => IPartialFormState<V>),
): F {
  // const newState: IPartialFormState<V> = clone(isFn(payload) ? payload(form.state) : payload)
  const newState: IPartialFormState<V> = isFn(payload) ? payload(form.state) : payload
  Keys(newState).forEach((stateType) => {
    form[stateType].value = newState[stateType]
  })
  return form
}
