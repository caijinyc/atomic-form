import type { FormInstance, IStateType, ResponseState, WatchStateOptions } from '@atomic-form/core'
import { isFunction, isPlainObject, isString } from '@atomic-form/shared'
import { useEffect } from 'react'

/**
 * watch the state of the form, when state changed will trigger the callback
 */
export function useWatchForm<
  V,
  W extends boolean = false,
  S = ResponseState<V, void, W>,
>(form: FormInstance<V>, cb: (res: S) => void, options?: WatchStateOptions<W>): S

/**
 * watch the state of the form by type, when state changed will trigger the callback
 */
export function useWatchForm<
  V,
  T extends IStateType,
  W extends boolean = false,
  S = ResponseState<V, T, W>,
>(
  form: FormInstance<V>,
  type: T,
  cb: (res: S) => void,
  options?: WatchStateOptions<W, S>,
): S

export function useWatchForm(form: FormInstance<any>, ...params: any[]) {
  const type: IStateType | undefined = isString(params[0])
    ? (params[0] as IStateType)
    : undefined
  const callback: (res: any) => void = isFunction(params[0]) ? params[0] : params[1]
  const options: WatchStateOptions = isPlainObject(params[1])
    ? params[1]
    : isPlainObject(params[2])
      ? params[2]
      : {}

  useEffect(() => {
    // @ts-expect-error
    const stop = form.watch(...[type, callback, options].filter(v => v))

    return () => {
      stop()
    }
  }, [type, form.uuid, options.sync, options.withAllChildNodes])
}
