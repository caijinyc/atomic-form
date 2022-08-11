import type { FormInstance, IStateType, ResponseState, WatchStateOptions } from '@atomic-form/core'
import { isArray, isPlainObject, pick } from '@atomic-form/shared'
import { useEffect, useRef } from 'react'
import { useForceRender } from '../shared/use-force-render'

/**
 * return whole state of the form
 * @param form
 * @param options
 */
export function useFormState<
  V,
  W extends boolean = false,
  S = ResponseState<V, void, W>,
>(form: FormInstance<V>, options?: WatchStateOptions<W>): S

/**
 * return state of the form by type
 * if withAllChildNodes is true, return whole state of the form + all children's state
 * @param form
 * @param type
 * @param options
 */
export function useFormState<
  V,
  T extends IStateType,
  W extends boolean = false,
  S = ResponseState<V, T, W>,
>(
  form: FormInstance<V>,
  type: T,
  options?: WatchStateOptions<W, S>,
): S

export function useFormState(form: FormInstance, ...params: any[]): any {
  const type: IStateType | IStateType[] | undefined = isPlainObject(params[0])
    ? undefined
    : (params[0] as IStateType | IStateType[])
  const options: WatchStateOptions = isPlainObject(params[0])
    ? params[0]
    : isPlainObject(params[1])
      ? params[1]
      : {}

  const render = useForceRender()

  // const getState = () =>
  //   options.withAllChildNodes
  //     ? form.getStateWithAllChildNodes(type)
  //     : type
  //       ? isArr(type)
  //         ? pick(form.state, type)
  //         : form.state[type]
  //       : form.state

  /**
   * TODO withAllChildNodes is not working
   */
  const getState = () => type
    ? isArray(type)
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
  }, [form.uuid, options.sync, options.withAllChildNodes, ...[isArray(type) ? undefined : type]])

  return state.current
}
