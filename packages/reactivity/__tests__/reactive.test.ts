import { expect, test, vitest } from 'vitest'
import { timeout } from '@atomic-form/shared'
import { effect, reactive } from '../src'

test('should work', () => {
  const obj = reactive({
    text1: 'text1',
    text2: 'text2',
  },
  )
  let triggeredText1 = 0
  let triggeredText2 = 0
  effect(() => {
    obj.text1
    triggeredText1++
  })
  effect(() => {
    obj.text2
    triggeredText2++
  })
  expect(triggeredText1).toBe(1)
  obj.text1 = 'x'
  obj.text2 = 'y'
  expect(triggeredText1).toBe(2)
  expect(triggeredText2).toBe(2)
})

test('branch & cleanup', () => {
  const obj = reactive({
    ok: false,
    text: 'hello',
  })

  const fn1 = vitest.fn()
  const fn2 = vitest.fn()

  let s = ''
  effect(() => {
    s = obj.ok ? obj.text : 'world'
    fn1()
  })

  obj.text = '1'
  obj.text = '2'
  obj.text = '3'
  expect(fn1).toHaveBeenCalledTimes(1)
  obj.ok = true
  expect(fn1).toHaveBeenCalledTimes(2)
  obj.text = 'bar'
  expect(fn1).toHaveBeenCalledTimes(3)
})

test('nested effect', () => {
  const obj = reactive({
    tom: 1,
    jerry: 1,
  })

  const fn1 = vitest.fn()
  const fn2 = vitest.fn()

  effect(() => {
    fn1()
    effect(() => {
      obj.jerry
      fn2()
    })
    obj.tom
  })

  obj.tom++
  expect(fn1).toHaveBeenCalledTimes(2)
  expect(fn2).toHaveBeenCalledTimes(2)

  obj.jerry++
  expect(fn1).toHaveBeenCalledTimes(2)
  /**
   * 这里就是会出发多次，因为 tom++ 的时候重新触发了 effect ..
   * 用 Vue reactivity 测试也是相同的结果
   */
  expect(fn2).toHaveBeenCalledTimes(4)
})

test('change value in effect without trigger infinite loop', () => {
  const obj = reactive({
    tom: 1,
  })

  let triggered = 0

  effect(() => {
    triggered++
    obj.tom++
  })

  expect(triggered).toBe(1)
  expect(obj.tom).toBe(2)
})

test('scheduler should work', async() => {
  const obj = reactive({
    tom: 1,
    jerry: 1,
  })

  const fn = vitest.fn()

  effect(() => {
    obj.tom++
    fn(obj.tom)
  }, {
    scheduler(effectFn) {
      setTimeout(() => { effectFn() })
    },
  })

  obj.tom++
  fn(obj.tom)
  expect(fn).toHaveBeenCalledTimes(2)
  await timeout(10)
  expect(fn).toHaveBeenCalledTimes(3)
  expect(fn).toHaveBeenNthCalledWith(1, 2)
  expect(fn).toHaveBeenNthCalledWith(2, 3)
  expect(fn).toHaveBeenNthCalledWith(3, 4)

  effect(() => {
    obj.jerry++
    fn(obj.jerry)
  })
  obj.jerry++
  fn(obj.jerry)
  expect(fn).toHaveBeenCalledTimes(6)
  expect(fn).toHaveBeenNthCalledWith(4, 2)
  expect(fn).toHaveBeenNthCalledWith(5, 4)
  expect(fn).toHaveBeenNthCalledWith(6, 4)
})
