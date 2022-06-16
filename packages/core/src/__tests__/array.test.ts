import { expect, test, vitest } from 'vitest'
import { nextTick } from '@atomic-form/shared'
import { FormAtom, createForm } from '../module'
import { FormAtomArray } from '../module/array'

test('node list should work', () => {
  const form = new FormAtom<{
    list: string[]
  }>({
    initialValue: { list: ['a', 'b'] },
  })
  const item1 = form.nodeArray('list').node(0)
  expect(item1.state.value).toEqual('a')
})

test('watch value change and add missing node', async() => {
  const form = new FormAtom<{
    arr: string[]
  }>({
    initialValue: { arr: ['a', 'b'] },
  })
  const arr = form.nodeArray('arr')
  expect(arr.children.length).toEqual(2)
  arr.setState({ value: ['a', 'b', 'c'] })
  await nextTick()
  expect(arr.children.length).toEqual(3)
})

test('watch value change and value.length < children.length', async() => {
  const form = new FormAtom<{
    arr: string[]
  }>({
    initialValue: { arr: ['a', 'b', 'c'] },
  })
  const arr = form.nodeArray('arr')
  expect(arr.children.length).toEqual(3)
  arr.setState({ value: ['c'] })
  await nextTick()
  expect(arr.children.length).toEqual(1)
})

test('API: watchChildren', async() => {
  const form = new FormAtom<{
    arr: string[]
  }>({
    initialValue: { arr: ['a', 'b'] },
  })
  const arr = form.nodeArray('arr')
  const fn = vitest.fn()
  arr.watchChildren((children) => {
    fn()
  }, { flush: 'sync' })
  expect(fn).not.toHaveBeenCalled()
  arr.node(2)
  expect(fn).toHaveBeenCalled()
})

test('create form use nodeArray', async() => {
  const arrForm = createForm<Array<string>>({ initialValue: ['a', 'b'] })
  expect(arrForm instanceof FormAtomArray).toBeTruthy()
  expect(arrForm.node(0).state.value).toEqual('a')
  arrForm.node(0).setState({ value: 'c' })
  expect(arrForm.node(0).state.value).toEqual('c')
})
