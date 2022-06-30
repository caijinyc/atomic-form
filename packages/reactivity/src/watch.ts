import { isArray, isFunction, isMap, isObject, isPlainObject, isSet } from '@atomic-form/shared'
import { effect, flushJob, jobQueue } from './reactive'
import { isRef } from './ref'

const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}

function traverse(value: unknown, seen: Set<unknown> = new Set()) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP])
    return value

  seen = seen || new Set()
  if (seen.has(value))
    return value

  seen.add(value)
  if (isRef(value)) {
    traverse(value.value, seen)
  }
  else if (isArray(value)) {
    for (let i = 0; i < value.length; i++)
      traverse(value[i], seen)
  }
  else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen)
    })
  }
  else if (isPlainObject(value)) {
    for (const key in value)
      traverse((value as any)[key], seen)
  }
  return value
}

type OnCleanup = (cleanupFn: () => void) => void
type InvalidateCbRegistrar = (cb: () => void) => void

export type WatchSource<T = any> = (() => T)
export type WatchStopHandle = () => void
export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: OnCleanup
) => any

export interface WatchOptionsBase {
  flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate
  deep?: boolean
}

export function watch(source: WatchSource | object, cb: WatchCallback, options: WatchOptions = {}) {
  let getter: Function

  if (isFunction(source))
    getter = source
  else
    getter = () => traverse(source)

  let oldValue: any, newValue: any
  let cleanup: () => void
  const onInvalidate: InvalidateCbRegistrar = (fn: () => void) => {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    if (cleanup) cleanup()
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        const p = Promise.resolve()
        p.then(job)
      }
      else if (options.flush === 'pre') {
        jobQueue.add(job)
        flushJob()
      }
      else {
        job()
      }
    },
  })

  if (options.immediate)
    job()
  else
    oldValue = effectFn()
}
