import { expect, test, vitest } from 'vitest'
import { clone, nextTick } from '@atomic-form/shared'
import { reactive, watch } from '../src'

test('watch should work', () => {
  const obj = reactive({
    foo: 1,
    bar: {
      foo: 2,
      bar: 3,
    },
  })
  const fn = vitest.fn()
  watch(() => obj.foo + obj.bar.foo, (value, oldValue, onCleanup) => {
    fn(value, oldValue)
  })
  expect(fn).toHaveBeenCalledTimes(0)
  obj.foo = 2
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith(4, 3)
  obj.bar.foo++
  expect(fn).toHaveBeenCalledWith(5, 4)
})

test('options immediate', async() => {
  const obj = reactive({
    foo: 1,
  })
  const fn = vitest.fn()
  watch(() => obj.foo, (value, oldValue, onCleanup) => {
    fn(value, oldValue)
  }, {
    immediate: true,
    flush: 'post',
  })
  expect(fn).toHaveBeenCalledTimes(1)
  obj.foo++
  obj.foo++
  obj.foo++
  obj.foo++
  expect(fn).toHaveBeenCalledTimes(1)
  await nextTick()
  expect(fn).toHaveBeenCalledTimes(5)
})

test('options flush', async() => {
  const obj = reactive({
    foo: 1,
  })
  const fn = vitest.fn()
  watch(() => obj.foo, (value, oldValue, onCleanup) => {
    fn(value, oldValue)
  }, {
    flush: 'post',
  })
  obj.foo++
  obj.foo++
  obj.foo++
  obj.foo++
  expect(fn).toHaveBeenCalledTimes(0)
  await nextTick()
  expect(fn).toHaveBeenCalledTimes(4)
})
test('onCleanup', async() => {
  const obj = reactive({
    foo: 1,
  })
  const fn = vitest.fn()
  let triggered = 0
  watch(() => obj.foo, async(value, oldValue, onCleanup) => {
    let invalid = false
    onCleanup(() => {
      invalid = true
    })
    if (triggered === 0)
      await nextTick()
    fn(triggered, invalid)
    triggered++
  })
  obj.foo++
  obj.foo++
  await nextTick()
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenCalledWith(0, true)
  expect(fn).toHaveBeenCalledWith(1, false)
})
