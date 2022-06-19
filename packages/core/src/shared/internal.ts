import { flatArray, isArr } from '@atomic-form/shared'
import type { Address, AtomType, FormInstance } from '../type/form-type'
import { FormAtom } from '../module'
import { FormAtomArray } from '../module/array'
import type { FormAtomBase } from '../module/base'

export const generatePathString = (addressArr: Address['pathArray']) => addressArr.join('/')

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

export const buildGetAllChildren = (form: FormInstance | FormAtomBase): Array<FormInstance> => {
  let children
  if (isArr(form.children))
    children = form.children.filter(f => f)
  else
    children = Object.values(form.children).filter(f => f)

  return [...children, ...flatArray(children.map(f => f.allChildren))]
}
