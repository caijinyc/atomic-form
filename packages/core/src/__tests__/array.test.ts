import { expect, test, vitest } from 'vitest'
import { nextTick } from '@atomic-form/shared'
import { FormAtom } from '../module'

test('node list should work', () => {
  const form = new FormAtom<{
    list: string[]
  }>({
    initialValue: { list: ['a', 'b'] },
  })
  const item1 = form.node('list', 'list').node(0)
  expect(item1.state.value).toEqual('a')
})

test('watch value change and add missing node', async() => {
  const form = new FormAtom<{
    arr: string[]
  }>({
    initialValue: { arr: ['a', 'b'] },
  })
  const arr = form.node('arr', 'list')
  expect(arr.children.length).toEqual(2)
  arr.setState({ value: ['a', 'b', 'c'] })
  await nextTick()
  expect(arr.children.length).toEqual(3)
})

test('API: watchChildren', async() => {
  const form = new FormAtom<{
    arr: string[]
  }>({
    initialValue: { arr: ['a', 'b'] },
  })
  const arr = form.node('arr', 'list')
  const fn = vitest.fn()
  arr.watchChildren((children) => {
    fn()
  }, { flush: 'sync' })
  expect(fn).not.toHaveBeenCalled()
  arr.node(2)
  expect(fn).toHaveBeenCalled()
})
