import type { State } from '../type'

/**
 * when you create a form,
 * if you don't give an initial state,
 * Form will use this state as DEFAULT_STATE,
 */
export const FORM_DEFAULT_STATE: Omit<State, 'value'> = {
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
