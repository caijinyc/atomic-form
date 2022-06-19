import type { FormEntity, IStateType, ResponseState, WatchStateOptions } from '@atomic-form/core'
import type { FormState } from '@atomic-form/core/src/module/state'
import { isFn, isPlainObj, isStr } from '@atomic-form/shared'
import { useEffect } from 'react'

/**
 * watch the state of the form, when state changed will trigger the callback
 */
export function useWatchForm<
  V,
  WithAllChildren extends boolean = false,
  S = ResponseState<V, void, WithAllChildren>,
>(form: FormEntity<V>, cb: (res: S) => void, options?: WatchStateOptions<WithAllChildren>): S

/**
 * watch the state of the form by type, when state changed will trigger the callback
 */
export function useWatchForm<
  V,
  T extends IStateType,
  WithAllChildren extends boolean = false,
  S = ResponseState<V, T, WithAllChildren>,
>(
  form: FormEntity<V>,
  type: T,
  cb: (res: S) => void,
  options?: WatchStateOptions<WithAllChildren, S>,
): S

export function useWatchForm(form: FormEntity<any>, ...params: any[]) {
  const type: keyof FormState<any> | undefined = isStr(params[0])
    ? (params[0] as keyof FormState<any>)
    : undefined
  const callback: (res: any) => void = isFn(params[0]) ? params[0] : params[1]
  const options: WatchStateOptions = isPlainObj(params[1])
    ? params[1]
    : isPlainObj(params[2])
      ? params[2]
      : {}

  useEffect(() => {
    // @ts-expect-error
    const stop = form.watch(...[type, callback, options].filter(v => v))

    return () => {
      stop()
    }
  }, [type, form.uuid, options.sync, options.withAllChildren])
}
