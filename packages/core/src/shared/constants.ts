import type { State } from '../type/form-type'

export const FORM_DEFAULT_VALUE: Omit<State, 'value'> = {
  visible: true,
  disableValidate: false,
  disabled: false,
  label: '',
  initialized: false,
  validating: false,

  modified: false,
  required: undefined,
  rules: undefined,
  error: undefined,
  initialValue: undefined,
}
