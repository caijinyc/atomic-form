import { describe, expect, test } from 'vitest'
import { FormAtom } from '../src/module'
import { FORM_DEFAULT_STATE } from '../src/shared/constants'

test('should works get state', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  expect(form.state.value).toEqual({ name: 'tom', age: 0 })
  expect(form.state).toEqual({
    ...FORM_DEFAULT_STATE,
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

  form.setState((old) => {
    return {
      value: {
        name: `tom&${old.value.name}`,
        age: 18,
      },
    }
  })

  expect(form.state.value).toEqual({ name: 'tom&jerry', age: 18 })
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
