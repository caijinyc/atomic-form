import type { IFormState } from '../type/form-type'
import type { FormAtomBase } from '../module/atom'

export type IStateType = keyof IFormState

export const getState = <StateType extends IStateType | IStateType[]>(
  formAtom: FormAtomBase,
  stateType?: StateType,
): StateType extends IStateType
  ? IFormState<any>[StateType]
  : StateType extends IStateType[]
    ? Pick<IFormState<any>, StateType[number]>
    : IFormState<any> => {
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
  return {
    value: formAtom.value.value,
    visible: formAtom.visible.value,
    label: formAtom.label.value,
    rules: formAtom.rules.value,
    error: formAtom.error.value,
    initialValue: formAtom.initialValue.value,
    disableValidate: formAtom.disableValidate.value,
    disabled: formAtom.disabled.value,
    initialized: formAtom.initialized.value,
    validating: formAtom.validating.value,
    modified: formAtom.modified.value,
    required: formAtom.required.value,
    // decorator: fc.decorator.value,
  } as any
}
