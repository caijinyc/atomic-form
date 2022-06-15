import { expect, test } from 'vitest'
import { FormAtom } from '../module'

test('API: allChildren', () => {
  const form = new FormAtom<{
    name: string
    age: number
  }>({
    initialValue: { name: 'tom', age: 0 },
  })
  const name = form.node('name')
  const age = form.node('age')
  expect(form.allChildren).toEqual([name, age])
})
