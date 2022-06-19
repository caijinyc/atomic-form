import { expect, test } from 'vitest'
import { createForm, triggerModified } from '../src'

test('triggerModified should work', () => {
  const form = createForm<{
    name: string
    age: number
    foo?: {
      goo: string
    }
  }>({
    initialValue: { name: 'tom', age: 0 },
  })

  const goo = form.node('foo').node('goo')

  expect(form.state.modified).not.toBeTruthy()
  expect(form.node('foo').state.modified).not.toBeTruthy()
  expect(goo.state.modified).not.toBeTruthy()

  triggerModified(goo)

  expect(form.state.modified).toBeTruthy()
  expect(form.node('foo').state.modified).toBeTruthy()
  expect(form.node('foo').node('goo').state.modified).toBeTruthy()
})
