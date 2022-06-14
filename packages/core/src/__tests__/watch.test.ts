import { expect, test, vitest } from 'vitest'
import { reactive, ref } from '@vue/reactivity'
import { nextTick } from '@atomic-form/shared'
import { watch, watchEffect } from '../watch'

test('should work', () => {
  let triggered = 0
  const counter = ref(0)

  const stop = watch(
    counter,
    () => {
      triggered += 1
    },
    { flush: 'sync' },
  )

  counter.value += 1
  expect(counter.value).toBe(1)
  expect(triggered).toBe(1)

  stop()
})

test('should work with deep reactive', () => {
  let triggered = 0
  const state = reactive<any>({
    foo: {
      bar: 'hi',
    },
  })

  const stop = watch(
    state,
    () => {
      triggered += 1
    },
    { flush: 'sync' },
  )

  state.foo.bar = 'hello'
  expect(triggered).toBe(1)
  state.world = 'yes'
  expect(triggered).toBe(2)
  stop()
})
//
test('should work with array reactive', () => {
  let triggered = 0
  const array = reactive<any>([1])

  const stop = watch(
    array,
    () => {
      triggered += 1
    },
    { flush: 'sync' },
  )

  array.push(2)
  expect(triggered).toBe(1)
  array[2] = 3
  expect(triggered).toBe(2)

  stop()
})

test('should work with watchEffect', () => {
  let sync = -1
  const counter = ref(0)

  const stop = watchEffect(
    () => {
      sync = counter.value
    },
    { flush: 'sync' },
  )

  expect(sync).toBe(0)
  counter.value += 1
  expect(sync).toBe(1)
  counter.value = 100
  expect(sync).toBe(100)

  stop()
})

test('should work with flush pre', async() => {
  let triggered = 0
  const counter = ref(0)
  const fn = vitest.fn()

  const stop = watch(
    counter,
    () => {
      triggered += 1
      fn()
    },
    { flush: 'pre' },
  );

  (new Array(100)).fill(0).forEach(() => {
    counter.value++
  })

  expect(counter.value).toBe(100)
  expect(triggered).toBe(0)
  expect(fn).toHaveBeenCalledTimes(0)

  await nextTick()
  expect(fn).toHaveBeenCalledTimes(1)

  stop()
})

test('should work with flush sync', async() => {
  let triggered = 0
  const counter = ref(0)
  const fn = vitest.fn()

  const stop = watch(
    counter,
    () => {
      triggered += 1
      fn()
    },
    { flush: 'sync' },
  );

  (new Array(100)).fill(0).forEach(() => {
    counter.value++
  })

  expect(counter.value).toBe(100)
  expect(triggered).toBe(100)
  expect(fn).toHaveBeenCalledTimes(100)

  stop()
})
