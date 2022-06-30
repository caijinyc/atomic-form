import type { State } from '../type'
import type { FormAtomBase } from '../module/base'

export type IStateType = keyof State

export const DEFINED_STATE_NAME: Array<IStateType> = [
  'value',
  'visible',
  'label',
  'rules',
  'error',
  'initialValue',
  'disableValidate',
  'disabled',
  'initialized',
  'validating',
  'modified',
  'required',
]

export const getState = <StateType extends IStateType | IStateType[]>(
  formAtom: FormAtomBase,
  stateType?: StateType,
): StateType extends IStateType
  ? State<any>[StateType]
  : StateType extends IStateType[]
    ? Pick<State<any>, StateType[number]>
    : State<any> => {
  if (stateType) {
    if (Array.isArray(stateType)) {
      const res: any = {}
      stateType.forEach((type) => {
        res[type] = formAtom[type].value
      })
      Object.keys(stateType)
      return res
    }
    else {
      return formAtom[stateType as IStateType].value
    }
  }

  return DEFINED_STATE_NAME.reduce((res, name) => {
    return {
      ...res,
      [name]: formAtom[name as IStateType].value,
    }
  }, {}) as any
}
