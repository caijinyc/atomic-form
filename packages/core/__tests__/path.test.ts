import { expect, test } from 'vitest'
import { FormAtom } from '../src/module'

test('should works basic use', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })
  const name = form.node('name')
  expect(name.state.value).toEqual('tom')

  name.setState({ value: 'jerry' })
  expect(form.state.value.name).toEqual('jerry')
  expect(name.state.value).toEqual('jerry')
})

test('should works deep atom', () => {
  const form = new FormAtom<{
    foo: {
      name: string
      age: number
    }
  }>({
    initialValue: { foo: { name: 'tom', age: 0 } },
  })
  const name = form.node('foo').node('name')
  expect(name.state.value).toEqual('tom')
  name.setState({ value: 'jerry' })
  expect(form.state.value.foo.name).toEqual('jerry')
})
