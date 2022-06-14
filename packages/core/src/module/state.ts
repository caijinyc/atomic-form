import type { Ref } from '@vue/reactivity'
import { ref } from '@vue/reactivity'
import { FORM_DEFAULT_VALUE } from '../shared/constants'
import type { IFormState } from '../type/form-type'

export class FormState<ValueType> {
  initialValue: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)
  value: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)

  label: Ref<IFormState['label']> = ref(FORM_DEFAULT_VALUE.label)
  visible: Ref<IFormState['visible']> = ref(FORM_DEFAULT_VALUE.visible)
  disabled: Ref<IFormState['disabled']> = ref(FORM_DEFAULT_VALUE.disabled)

  initialized: Ref<IFormState['initialized']> = ref(FORM_DEFAULT_VALUE.initialized)
  modified: Ref<IFormState['modified']> = ref(FORM_DEFAULT_VALUE.modified)
  required: Ref<IFormState['required']> = ref(FORM_DEFAULT_VALUE.required)
  rules: Ref<IFormState['rules']> = ref(FORM_DEFAULT_VALUE.rules)
  error: Ref<IFormState['error']> = ref(FORM_DEFAULT_VALUE.error)
  disableValidate: Ref<IFormState['disableValidate']> = ref(FORM_DEFAULT_VALUE.disableValidate)

  // WIP
  validating: Ref<IFormState['validating']> = ref(FORM_DEFAULT_VALUE.validating)
  // component: Ref<IComponent | undefined> = ref(undefined);
  // decorator: Ref<IComponent | undefined> = ref(undefined);
}
