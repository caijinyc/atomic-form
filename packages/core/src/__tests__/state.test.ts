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

test('should work setValue', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  form.setValue({
    name: 'jerry',
    age: 18,
  })

  expect(form.state.value).toEqual({ name: 'jerry', age: 18 })
})
