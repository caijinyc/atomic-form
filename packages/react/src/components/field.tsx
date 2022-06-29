import type { FormInstance, PartialState, State } from '@atomic-form/core'
import { triggerModified } from '@atomic-form/core'
import React, { useEffect } from 'react'
import { isEqual, isFunction } from '@atomic-form/shared'
import { useFormState } from '../hooks'

export type JSXComponent = any
export type ValidateTriggerType = string[] | string
export interface FieldProps<ValueType = any> {
  form: FormInstance<ValueType>
  /**
   * defaultState only works when Field Component first mounted
   * @defaultState undefined
   */
  defaultState?: PartialState<ValueType>
  /**
   * WIP
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
   * WIP
   */
  rules?: any[]
  /**
   * WIP
   * set validate trigger condition
   * default trigger is `onChange`, you can set it to `onBlur` or `onSubmit`
   * @default ['onChange']
   */
  validateTrigger?: ValidateTriggerType
  /**
   * WIP
   * @default false
   * when form unmount, field value and error will be set to undefined
   */
  autoDelete?: boolean
  /**
   * WIP
   * @default true
   * form will not validate field when component unmount
   */
  autoDisableValidate?: false
}

const DEFAULT_PROPS: Partial<FieldProps> = {
  validateTrigger: ['onChange'],
}

function FieldCore<ValueType = any>(props: FieldProps<ValueType>) {
  const form = props.form
  const state = useFormState(props.form, { sync: true })
  const value = state.value

  const node = (isFunction(props.children) ? props.children(state) : props.children) as React.ReactElement
  const oldVal = props.mapValue ? props.mapValue(value) : value

  if (!state.visible) return null

  const renderComponent = () =>
    React.cloneElement(node, {
      ...node.props,
      // ...validateTriggerEvents, TODO
      /**
       * oldValue || '', the empty string is used to decide component is controlled component.
       * https://reactjs.org/docs/forms.html#controlled-components
       * https://bobbyhadz.com/blog/react-component-changing-uncontrolled-input
       */
      [props.valuePropName || 'value']: oldVal || '',
      onChange: (...args: any[]) => {
        const [e] = args

        const newVal = props.getValueFromEvent
          ? props.getValueFromEvent(...args)
          : typeof e === 'object' && e != null && 'preventDefault' in e
            ? e.target.value
            : e
        const newV = props.onUpdateValue ? props.onUpdateValue(newVal, oldVal as any) : newVal

        form.setState(
          {
            value: newV,
          },
        )
        /**
         * when user edit the form what is wrapped by Field, state `modified` will be set to true
         * TIP: all parent form will also be modified
         */
        if (!form.state.modified)
          triggerModified(form as any)

        // TODO
        // if (validateTrigger.includes('onChange')) {
        //   // 表单值发生变更时触发校验
        //   form.validateWithAllParent('onChange')
        // }

        const oldOnChange = node.props.onChange

        if (oldOnChange)
          oldOnChange(...args)
      },
    })

  return renderComponent()
}

export function Field<Value = any>(originProps: FieldProps<Value>) {
  const props = {
    ...DEFAULT_PROPS,
    ...originProps,
  }
  const form = props.form
  const initialized = useFormState(form, 'initialized')
  useEffect(() => {
    if (!initialized) {
      form.initialize({
        ...props.defaultState,
      })
    }
  }, [])

  useEffect(() => {
    if (props.rules && !isEqual(form.state.rules, props.rules)) {
      form.setState(
        {
          rules: props.rules,
        },
      )
    }
  }, [props.rules])

  return <FieldCore {...props} >{props.children}</FieldCore>
}
