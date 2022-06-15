import { flatArray, isArr } from '@atomic-form/shared'
import type { AtomType, IForm, IPartialFormState } from '../type/form-type'
import { FormAtom } from '../module'
import { FormAtomArray } from '../module/array'
import type { IFormAddress } from '../type'

export const generatePathString = (addressArr: IFormAddress['pathArray']) => addressArr.join('/')

const resetFormArrayChildrenAddress = (form: FormAtomArray) => {
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
  ...insertItem: IPartialFormState<any>[]
) => {
  const list: Array<FormAtom | FormAtomArray> = []

  insertItem.forEach((state) => {
    if (isArr(state.value))
      list.push(form.node(form.children.length))
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

export const buildNode = (form: any, path: any, type?: AtomType): any => {
  if (!form.children[path]) {
    const props = {
      path,
      rootNode: form.root,
      parentNode: form,
    }
    if (type === 'list')
      form.children[path] = new FormAtomArray(props)
    else
      form.children[path] = new FormAtom(props)
  }
  return form.children[path] as any
}

export const buildGetAllChildren = (form: IForm): Array<IForm> => {
  let children
  if (isArr(form.children))
    children = form.children.filter(f => f)
  else
    children = Object.values(form.children).filter(f => f)

  return [...children, ...flatArray(children.map(f => f.allChildren))]
}
