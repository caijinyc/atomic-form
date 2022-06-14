import { describe, expect, test } from 'vitest'
import { FormAtom } from '../module'
import { FORM_DEFAULT_VALUE } from '../shared/constants'

test('should works get state', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  expect(form.state.value).toEqual({ name: 'tom', age: 0 })
  expect(form.state).toEqual({
    ...FORM_DEFAULT_VALUE,
    initialValue: { name: 'tom', age: 0 },
    value: { name: 'tom', age: 0 },
  })
})

test('should work setState', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  form.setState({
    value: {
      name: 'jerry',
      age: 18,
    },
  })

  expect(form.state.value).toEqual({ name: 'jerry', age: 18 })
})

describe('should work watch state', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  test('should work sync', () => {
    let sync = form.state.value
    let triggered = 0
    form.watch('value', (v) => {
      sync = v
      triggered++
    }, { sync: true })

    new Array(10).fill(0).forEach((_, i) => {
      form.setState({
        value: {
          name: 'xx',
          age: i,
        },
      })
    })

    expect(sync).toEqual({ name: 'xx', age: 9 })
    expect(triggered).toBe(10)
  })

  test('should work watch immediate', () => {
    let sync
    form.watch('value', (v) => {
      sync = v
    }, { sync: true, immediate: true })
    form.setState({
      value: {
        name: 'zzj',
        age: 3,
      },
    })
    expect(sync).toEqual({ name: 'zzj', age: 3 })
  })
})
