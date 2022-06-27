import { effect, trigger } from './reactive'

export function computed(getter: () => any) {
  let dirty = true
  let value: any
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty)
        dirty = true
    },
  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      return value
    },
  }

  return obj
}
