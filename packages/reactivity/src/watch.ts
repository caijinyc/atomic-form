import { ComputedRef, Ref, isRef } from '@vue/reactivity'
import { isArray, isMap, isObject, isPlainObject, isSet } from '@atomic-form/shared'
import { effect } from './reactive'

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

type InvalidateCbRegistrar = (cb: () => void) => void
export type WatchSource<T = any> = (() => T)
export type WatchStopHandle = () => void

declare function watch<T>(getter: () => T, cb: (newValue: T,) => void, options: {
  immediate?: boolean
}): () => void

export function watch(getter: () => unknown, cb: () => void, options: { immediate?: boolean } = {}) {
  const effectFn = effect(getter, {
    lazy: true,
    // onTrack: () => {
    //   // console.log('onTrack')
    // },
    // onTrigger: () => {
    //   // console.log('onTrigger')
    // },
    scheduler: () => {
      // console.log('scheduler')
    },
  })

  // initial run
  if (cb) {
    if (options.immediate)
      cb()
    else
      effect.run()
  }
  else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}
