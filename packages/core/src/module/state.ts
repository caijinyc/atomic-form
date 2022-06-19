import type { Ref } from '@vue/reactivity'
import { ref } from '@vue/reactivity'
import { FORM_DEFAULT_STATE } from '../shared/constants'
import type { State } from '../type'

export class FormState<ValueType> {
  /**
   * when you set initialValue and value is invalid, it will be set to value
   */
  initialValue: Ref<ValueType> = ref(FORM_DEFAULT_STATE.initialValue)
  /**
   * just form value
   * Tip:
   *   Parent Atom value includes all children's value
   *   so, if you set parent atom value, it will also set children's value
   *   if you set children's value, it will also set parent atom value
   */
  value: Ref<ValueType> = ref(FORM_DEFAULT_STATE.initialValue)
  label: Ref<State['label']> = ref(FORM_DEFAULT_STATE.label)
  /**
   * @default undefined
   * if visible is undefined, it means it's always visible
   * if visible is false, it means it's always invisible, Field will not render wrapped component
   */
  visible: Ref<State['visible']> = ref(FORM_DEFAULT_STATE.visible)
  /**
   * Field will
   */
  disabled: Ref<State['disabled']> = ref(FORM_DEFAULT_STATE.disabled)
  /**
   * @default false
   * when React Field Component mounted, set to true
   */
  initialized: Ref<State['initialized']> = ref(FORM_DEFAULT_STATE.initialized)
  /**
   * @default false
   * when user edit the form what is wrapped by Field, state `modified` will be set to true
   * TIP: all parent form will also be modified
   */
  modified: Ref<State['modified']> = ref(FORM_DEFAULT_STATE.modified)
  required: Ref<State['required']> = ref(FORM_DEFAULT_STATE.required)
  rules: Ref<State['rules']> = ref(FORM_DEFAULT_STATE.rules)
  error: Ref<State['error']> = ref(FORM_DEFAULT_STATE.error)
  disableValidate: Ref<State['disableValidate']> = ref(FORM_DEFAULT_STATE.disableValidate)

  // WIP
  validating: Ref<State['validating']> = ref(FORM_DEFAULT_STATE.validating)
  // component: Ref<IComponent | undefined> = ref(undefined);
  // decorator: Ref<IComponent | undefined> = ref(undefined);
}
