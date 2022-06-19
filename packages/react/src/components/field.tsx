import type { FormInstance, PartialState, State } from '@atomic-form/core'
import type React from 'react'

export type JSXComponent = any
export type ValidateTriggerType = string[] | string
export interface FieldProps<ValueType = any> {
  form?: FormInstance<ValueType>
  /**
   * WI
   */
  rules?: any[]
  /**
   * defaultState only works when Field Component first mounted
   * @defaultState undefined
   */
  defaultState?: PartialState<ValueType>
  /**
   * form decorator, used to wrap FieldWrapper to implement different UI components
   * @default React.Fragment
   */
  decorator?: any
  /**
   * Component children should be a ReactNode or function(props: FormState) => ReactNode
   * Field Component will take over the component's value and onChange, make the component controlled
   */
  children: React.ReactNode | ((state: State<ValueType>) => React.ReactNode)
  /**
   * when wrapped component trigger value change, you can use onUpdateValue to handle value change
   * onUpdateValue's return value will be the final value
   */
  onUpdateValue?(newValue: ValueType, oldValue: ValueType): ValueType
  /**
   * map your form value to the component need's value
   */
  mapValue?(value: ValueType): ValueType
  /**
   * @default ['onChange']
   * set field validate trigger
   */
  /**
   * @default value
   * if component receive value prop is not 'value', you can set it with this
   * like Checkbox's is 'checked'
   */
  valuePropName?: string
  /**
   * set how to transform event value to field value
   * if you want to transform event value to field value, you can use this
   * @default (event) => event.target.value
   */
  getValueFromEvent?: (...args: any[]) => any
  /**
   * set validate trigger condition
   * default trigger is `onChange`, you can set it to `onBlur` or `onSubmit`
   * @default ['onChange']
   */
  validateTrigger?: ValidateTriggerType
  /**
   * @default false
   * when form unmount, field value and error will be set to undefined
   */
  autoDelete?: boolean
  /**
   * @default true
   * form will not validate field when component unmount
   */
  autoDisableValidate?: false
}

export function Field() {

}
