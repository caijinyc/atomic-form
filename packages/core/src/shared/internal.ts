import { Keys, flatArray, isArr, isFn } from '@atomic-form/shared'
import type { Address, AtomType, FormInstance, PartialState, State } from '../type/form-type'
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

export const triggerModified = (form: FormInstance) => {
  [form, ...form.allParent].forEach(f =>
    f.setState(
      {
        modified: true,
      },
    ),
  )
}

export function buildSetState<V, F extends FormAtomBase>(
  form: F,
  payload: PartialState<V> | ((oldState: State<V>) => PartialState<V>),
): F {
  // const newState: IPartialFormState<V> = clone(isFn(payload) ? payload(form.state) : payload)
  const newState: PartialState<V> = isFn(payload) ? payload(form.state) : payload
  Keys(newState).forEach((stateType) => {
    form[stateType].value = newState[stateType]
  })
  return form
}
