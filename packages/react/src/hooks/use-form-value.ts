import type { FormInstance, WatchStateOptions } from '@atomic-form/core'
import { useFormState } from './use-form-state'

/**
 * just like useFormState, but only return the state of the specified type
 * @param form
 * @param options
 */
export function useFormValue<
  V,
>(form: FormInstance<V>, options?: WatchStateOptions): V {
  return useFormState(form, 'value', options)
}
