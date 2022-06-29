import { isArray } from '@atomic-form/shared'
import type { FormAtomArray } from '../module/array'
import type { PartialState } from '../type/form-type'
import type { FormAtom } from '../module'
import { generatePathString } from './internal'

export const resetFormArrayChildrenAddress = (form: FormAtomArray<any, any, any>) => {
  form.children.forEach((fc, i) => {
    fc.address.pathArray.splice(form.address.pathArray.length, 1, i)
    fc.address.pathString = generatePathString(fc.address.pathArray)
  })

  form.children.forEach((f, i) => {
    f.allChildren.forEach((fc) => {
      if (
        fc.address.pathString.indexOf(form.address.pathString) === 0
        && fc.address.pathString !== form.address.pathString
      ) {
        fc.address.pathArray.splice(form.address.pathArray.length, 1, i)
        fc.address.pathString = generatePathString(fc.address.pathArray)
      }
    })
  })
}

export const spliceArrayChildren = (
  form: FormAtomArray<any, any, any>,
  // form: any,
  startIndex: number,
  deleteCount: number,
  ...insertItem: PartialState<any>[]
) => {
  const list: Array<FormAtom | FormAtomArray> = []

  insertItem.forEach((state) => {
    if (isArray(state.value))
      list.push(form.nodeArray(form.children.length))
    else
      list.push(form.node(form.children.length))
  })

  // 取出添加的节点
  form.children.splice(form.children.length - list.length, list.length)
  // 放置到对应位置
  const deletedChildren = form.children.splice(startIndex, deleteCount, ...list)

  // 移除被删除节点的 watch 方法
  deletedChildren.forEach((form) => {
    [form, ...form.allChildren].forEach(f => f.stopWatch())
  })

  resetFormArrayChildrenAddress(form)
  return form
}

export const processFromAndToIndex = (value: any[], from: number, to: number) => {
  if (from < 0)
    from = 0
  else if (from >= value.length)
    from = value.length - 1

  if (to < 0)
    to = 0
  else if (to >= value.length)
    to = value.length - 1

  return { from, to }
}
