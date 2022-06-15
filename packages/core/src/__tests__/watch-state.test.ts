import { describe, expect, test, vitest } from 'vitest'
import { FormAtom } from '../module'

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

test('should works watch children value', () => {
  const form = new FormAtom<{
    foo: {
      name: string
      age: number
    }
  }>({
    initialValue: { foo: { name: 'tom', age: 0 } },
  })

  const fn = vitest.fn()

  const name = form.node('foo').node('name')

  form.watch('value', (v) => {
    fn(v)
  }, { sync: true })

  name.setState({ value: 'jerry' })

  expect(fn).toHaveBeenCalledWith({ foo: { name: 'jerry', age: 0 } })
  expect(fn).toHaveBeenCalledTimes(1)
})
