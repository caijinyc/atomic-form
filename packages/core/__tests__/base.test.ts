import { expect, test } from 'vitest'
import { createForm } from '../src'

test('allParent should work', () => {
  const form = createForm<{
    name: string
    age: number
    foo?: {
      goo: string
    }
  }>({
    initialValue: { name: 'tom', age: 0 },
  })
  const allParent = form.node('name').allParent
  expect(allParent).toEqual([form])
  const goo = form.node('foo').node('goo')
  expect(goo.allParent).toEqual([form.node('foo'), form])
})

test('form.initialize should work', () => {
  const form = createForm<{
    name?: string
    age: number
  }>({
    initialValue: { age: 0 },
  })

  expect(form.state.initialized).not.toBeTruthy()
  form.initialize({
    initialValue: {
      age: 10,
    },
  })
  expect(form.state.initialized).toBeTruthy()
  // if form state value is valid, initialize will not change it
  expect(form.state.value.age).not.toEqual(10)

  form.node('name').initialize({ initialValue: 'tom' })
  expect(form.node('name').initialized).toBeTruthy()
  expect(form.node('name').state.value).toEqual('tom')
})
