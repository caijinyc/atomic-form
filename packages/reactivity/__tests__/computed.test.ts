import { expect, test, vitest } from 'vitest'
import { computed, effect, reactive } from '../src'

test('computed should work well', () => {
  const obj = reactive({ a: 1, b: 2 })
  const sumRef = computed(() => obj.a + obj.b)
  expect(sumRef.value).toBe(3)
  obj.a = 3
  expect(sumRef.value).toBe(5)
})

test('computed cache should work', () => {
  const obj = reactive({ a: 1, b: 2 })
  const fn = vitest.fn()
  const sumRef = computed(() => {
    fn()
    return obj.a + obj.b
  })
  sumRef.value
  sumRef.value
  sumRef.value
  expect(fn).toHaveBeenCalledTimes(1)
})

// test('computed work in effect', () => {
//   const obj = reactive({ a: 1, b: 2 })
//   const fn = vitest.fn()
//   const sumRef = computed(() => {
//     return obj.a + obj.b
//   })
//   effect(() => {
//     fn(sumRef.value)
//   })
//   expect(fn).toHaveBeenCalledTimes(1)
//   obj.a++
//   expect(fn).toHaveBeenCalledTimes(2)
// })
