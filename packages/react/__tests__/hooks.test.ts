import { describe, expect, test, vitest } from 'vitest'
import { act, renderHook } from '@testing-library/react-hooks'
import { nextTick } from '@atomic-form/shared'
import { FORM_DEFAULT_VALUE } from '@atomic-form/core/src/shared/constants'
import { createForm } from '@atomic-form/core'
import { useForm, useFormState, useFormValue, useWatchForm } from '../src/hooks'

test('useForm should work', () => {
  const { result } = renderHook(() => useForm<{ foo: string }>({ initialValue: { foo: 'ff' } }))
  expect(result.current.state.value).toEqual({ foo: 'ff' })
  const foo = result.current.node('foo')
  expect(foo.state.value).toEqual('ff')
})

describe('useFormState', () => {
  test('should work well', () => {
    const form = createForm({ initialValue: { foo: 'ff' } })
    const { result: stateRef } = renderHook(() => useFormState(form, { sync: true }))
    expect(stateRef.current).toEqual({
      ...FORM_DEFAULT_VALUE,
      initialValue: { foo: 'ff' },
      value: { foo: 'ff' },
    })

    form.setValue({ foo: 'xx' })
    expect(stateRef.current).toEqual({
      ...FORM_DEFAULT_VALUE,
      initialValue: { foo: 'ff' },
      value: { foo: 'xx' },
    })
  })

  test('state type', () => {
    const form = createForm({ initialValue: { foo: 'ff' } })
    const { result: valueRef } = renderHook(() => useFormState(form, 'value', { sync: true }))
    expect(valueRef.current).toEqual({ foo: 'ff' })
    form.setValue({ foo: 'joo' })
    expect(valueRef.current).toEqual({ foo: 'joo' })
  })

  test('unmount will stop watch', () => {
    const form = createForm({ initialValue: { foo: 'ff' } })
    const { result: valueRef, unmount } = renderHook(() => useFormState(form, 'value', { sync: true }))
    unmount()
    form.setValue({ foo: 'joo' })
    expect(valueRef.current).toEqual({ foo: 'ff' })
  })
})

test('useFormValue should work', () => {
  const form = createForm({ initialValue: { foo: 'ff' } })
  const { result: valueRef } = renderHook(() => useFormValue(form, { sync: true }))
  expect(valueRef.current).toEqual({ foo: 'ff' })
  form.setValue({ foo: 'joo' })
  expect(valueRef.current).toEqual({ foo: 'joo' })
})

test('useWatchForm should work', () => {
  const form = createForm({ initialValue: { foo: 'ff' } })
  const fn = vitest.fn()
  const { unmount } = renderHook(() => useWatchForm(form, (state) => {
    fn(state)
  }, { sync: true }))
  form.setValue({ foo: 'joo' })
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toBeCalledWith({
    ...FORM_DEFAULT_VALUE,
    initialValue: { foo: 'ff' },
    value: { foo: 'joo' },
  })

  // unmount will stop watch
  unmount()
  form.setValue({ foo: 'joox' })
  expect(fn).toHaveBeenCalledTimes(1)

  const { unmount: u } = renderHook(() => useWatchForm(form, 'value', (val) => {
    fn(val)
  }, { sync: true }))

  form.setValue({ foo: 'jooxx' })
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toBeCalledWith({ foo: 'jooxx' })
  u()

  // immediately call
  form.setValue({ foo: 'joozzzz' })
  renderHook(() => useWatchForm(form, 'value', (val) => {
    fn(val)
  }, { sync: true, immediate: true }))
  expect(fn).toHaveBeenCalledWith({ foo: 'joozzzz' })
})
