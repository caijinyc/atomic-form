interface ReactiveEffect extends Function{
  deps: Set<Function>[]
}

const bucket = new WeakMap<object, Map<any, Set<ReactiveEffect>>>()
let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []

export function effect(fn: Function) {
  const effectFn: ReactiveEffect = () => {
    /**
     * p.54
     * when we call a reactive effect, we need to: cleanup old dependencies
     */
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn: ReactiveEffect) {
  const { deps } = effectFn
  if (deps.length) {
    for (let i = 0; i < deps.length; i++)
      deps[i].delete(effectFn)
    deps.length = 0
  }
}

function track(target: any, key: string | symbol) {
  if (!activeEffect) return

  let depsMap = bucket.get(target)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, deps = new Set())

  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target: any, key: string | symbol, value: any) {
  target[key] = value
  const depsMap = bucket.get(target)
  if (depsMap) {
    const effects = depsMap.get(key)
    /**
     * p.54 infinite loop error
     */
    if (effects) {
      const effectsToTrigger = new Set<ReactiveEffect>()
      /**
       * p.59
       * prevent infinite loop
       */
      effects.forEach((effectFn) => {
        if (effectFn !== activeEffect)
          effectsToTrigger.add(effectFn)
      })

      effectsToTrigger.forEach(fn => fn())
    }
  }
}

export function reactive(target: any) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      trigger(target, key, value)
      return true
    },
  })
}
