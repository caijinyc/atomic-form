import { isFn, isPlainObj } from '@atomic-form/shared'
import type { FormAtom } from '../module/atom'
import type { IStop, IWatchStateChangeOptions } from '../type/form-type'
import { watch } from '../watch'
import type { IStateType } from './get-state'
import { getState } from './get-state'
import { buildLazyCallback } from './index'

const DEFAULT_OPTIONS: IWatchStateChangeOptions = {
  compare: true,
}

export const buildWatchStateChange = (form: FormAtom, ...params: any): IStop => {
  const stateType: IStateType | IStateType[] = isFn(params[0]) ? undefined : params[0]
  const options: IWatchStateChangeOptions = {
    ...DEFAULT_OPTIONS,
    ...(isPlainObj(params[1]) ? params[1] : isPlainObj(params[2]) ? params[2] : {}),
  }

  // batch update at the same time will emit callback function only once
  const originCb = isFn(params[0]) ? params[0] : params[1]
  const cb = originCb

  let source: () => any

  if (stateType) {
    source = () => getState(form, stateType)
  }
  else {
    source = () => {
      return getState(form)
    }
  }

  return watch(source, cb, { deep: true, immediate: options.immediate, flush: options.sync ? 'sync' : 'pre' })
}
