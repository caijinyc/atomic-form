import { describe, expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react-hooks'
import { nextTick } from '@atomic-form/shared'
import { FORM_DEFAULT_VALUE } from '@atomic-form/core/src/shared/constants'
import { useForm, useFormState, useFormValue } from '../src/hooks'

test('useForm should work', () => {
  const { result } = renderHook(() => useForm<{ foo: string }>({ initialValue: { foo: 'ff' } }))
  expect(result.current.state.value).toEqual({ foo: 'ff' })
  const foo = result.current.node('foo')
  expect(foo.state.value).toEqual('ff')
})

describe('useFormState', () => {
  test('should work well', () => {
    const { result } = renderHook(() => useForm<{ foo: string }>({ initialValue: { foo: 'ff' } }))
    const form = result.current

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
    const { result } = renderHook(() => useForm<{ foo: string }>({ initialValue: { foo: 'ff' } }))
    const form = result.current

    const { result: valueRef } = renderHook(() => useFormState(form, 'value', { sync: true }))
    expect(valueRef.current).toEqual({ foo: 'ff' })
    form.setValue({ foo: 'joo' })
    expect(valueRef.current).toEqual({ foo: 'joo' })
  })
})

test('useFormValue should work', () => {
  const { result } = renderHook(() => useForm<{ foo: string }>({ initialValue: { foo: 'ff' } }))
  const form = result.current
  const { result: valueRef } = renderHook(() => useFormValue(form, { sync: true }))
  expect(valueRef.current).toEqual({ foo: 'ff' })
  form.setValue({ foo: 'joo' })
  expect(valueRef.current).toEqual({ foo: 'joo' })
})
