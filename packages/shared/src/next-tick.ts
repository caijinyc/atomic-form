/**
 * Vue next-tick
 * https://v3.cn.vuejs.org/api/global-api.html#nexttick
 */
const resolvedPromise: Promise<any> = Promise.resolve()
const currentFlushPromise: Promise<void> | null = null

export function nextTick<T = void>(this: T, fn?: (this: T) => void): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

export function timeout(time?: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
