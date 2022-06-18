import type { Ref } from '@vue/reactivity'
import { ref } from '@vue/reactivity'
import { FORM_DEFAULT_VALUE } from '../shared/constants'
import type { State } from '../type/form-type'

export class FormState<ValueType> {
  initialValue: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)
  value: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)

  label: Ref<State['label']> = ref(FORM_DEFAULT_VALUE.label)
  visible: Ref<State['visible']> = ref(FORM_DEFAULT_VALUE.visible)
  disabled: Ref<State['disabled']> = ref(FORM_DEFAULT_VALUE.disabled)

  initialized: Ref<State['initialized']> = ref(FORM_DEFAULT_VALUE.initialized)
  modified: Ref<State['modified']> = ref(FORM_DEFAULT_VALUE.modified)
  required: Ref<State['required']> = ref(FORM_DEFAULT_VALUE.required)
  rules: Ref<State['rules']> = ref(FORM_DEFAULT_VALUE.rules)
  error: Ref<State['error']> = ref(FORM_DEFAULT_VALUE.error)
  disableValidate: Ref<State['disableValidate']> = ref(FORM_DEFAULT_VALUE.disableValidate)

  // WIP
  validating: Ref<State['validating']> = ref(FORM_DEFAULT_VALUE.validating)
  // component: Ref<IComponent | undefined> = ref(undefined);
  // decorator: Ref<IComponent | undefined> = ref(undefined);
}
