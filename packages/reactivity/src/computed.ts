import { effect, track, trigger } from './reactive'

export function computed(getter: () => any) {
  let dirty = true
  let value: any
  let effectFn: any = () => {}
  const obj = {
    get value() {
      track(obj, 'value')
      // 当计算属性被访问的时候，如果 dirty 为 true，则执行 getter 函数
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      return value
    },
  }

  effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      // 当依赖项变更后，重置 dirty 为 true
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    },
  })

  return obj
}
