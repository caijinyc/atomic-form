import type { FormInstance, IStateType, ResponseState, WatchStateOptions } from '@atomic-form/core'
import { isArr, isPlainObj, pick } from '@atomic-form/shared'
import { useEffect, useRef } from 'react'
import { useForceRender } from '../shared/use-force-render'

/**
 * return whole state of the form
 * @param form
 * @param options
 */
export function useFormState<
  V,
  WithAllChildren extends boolean = false,
  S = ResponseState<V, void, WithAllChildren>,
>(form: FormInstance<V>, options?: WatchStateOptions<WithAllChildren>): S

/**
 * return state of the form by type
 * if withAllChildren is true, return whole state of the form + all children's state
 * @param form
 * @param type
 * @param options
 */
export function useFormState<
  V,
  T extends IStateType,
  WithAllChildren extends boolean = false,
  S = ResponseState<V, T, WithAllChildren>,
>(
  form: FormInstance<V>,
  type: T,
  options?: WatchStateOptions<WithAllChildren, S>,
): S

export function useFormState(form: FormInstance, ...params: any[]): any {
  const type: IStateType | IStateType[] | undefined = isPlainObj(params[0])
    ? undefined
    : (params[0] as IStateType | IStateType[])
  const options: WatchStateOptions = isPlainObj(params[0])
    ? params[0]
    : isPlainObj(params[1])
      ? params[1]
      : {}

  const render = useForceRender()

  // const getState = () =>
  //   options.withAllChildren
  //     ? form.getStateWithAllChildren(type)
  //     : type
  //       ? isArr(type)
  //         ? pick(form.state, type)
  //         : form.state[type]
  //       : form.state

  /**
   * TODO withAllChildren is not working
   */
  const getState = () => type
    ? isArr(type)
      ? pick(form.state as any, type)
      : form.state[type]
    : form.state

  const state = useRef<any>(getState())

  useEffect(() => {
    state.current = getState()
    render()

    const params = [
      type,
      (newState: any) => {
        state.current = newState
        render()
      },
      options,
    ] as any

    // @ts-expect-error
    const stop = form.watch(...params)

    return () => {
      stop()
    }
  }, [form.uuid, options.sync, options.withAllChildren, ...[isArr(type) ? undefined : type]])

  return state.current
}
