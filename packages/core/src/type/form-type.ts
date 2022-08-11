import type { RuleItem } from 'async-validator/dist-types/interface'
import type { IStateType } from '../shared/get-state'
import type { FormAtom, FormAtomArray } from '../module'

export interface State<ValueType = any> {
  /**
   * @default undefined
   * when you set initialValue and value is invalid, it will be set to value
   */
  initialValue?: ValueType
  /**
   * just form value
   * Tip:
   *   Parent Atom value includes all children's value
   *   so, if you set parent atom value, it will also set children's value
   *   if you set children's value, it will also set parent atom value
   */
  value: ValueType
  /**
   * @default ''
   * just label of form, if you use defaultState set your label in Field,
   * it will be set to state.label
   * or you could use form.setState({ label: 'Name' }) to set label
   */
  label: any
  /**
   * @default false
   * if visible is undefined, it means it's always visible
   * if visible is false, it means it's always invisible, Field will not render wrapped component
   */
  visible: boolean
  /**
   * @default false
   * just state of form instance, if you use defaultState set your disabled in Field,
   * it will be set to state.disabled
   * or you could use form.setState({ disabled: true }) to set disabled
   */
  disabled: boolean
  /**
   * @default false
   * when user edit the form what is wrapped by Field, state `modified` will be set to true
   * TIP: all parent form will also be modified
   */
  modified: boolean
  /**
   * @default false
   * when React Field Component mounted, set to true
   */
  initialized: boolean

  // WIP
  validating: boolean
  required?: boolean
  disableValidate: boolean
  rules?: RuleItem[]
  error?: ErrorType
}

export type PartialState<V> = Partial<State<V>>

export interface ErrorType<V = any> {
  status: 'success' | 'error' | 'warning'
  help: string[]
  /**
   * 节点字段，你使用 .node(field) 中填的就是
   * 例如 name 的表单路径为 `userInfo/name`
   * 它的节点字段为 name
   */
  field?: string
  /**
   * 节点路径
   * 例如 userInfo.name 的表单路径为 `userInfo/name`
   */
  path?: string
  /**
   * 校验触发时的表单值
   */
  value?: V
}

export type HandleStop = () => void

export type ResponseState<V, StateType extends (IStateType | IStateType[] | void), W> = StateType extends IStateType
  ? W extends false
    ? State<V>[StateType]
    : Record<string, State<any>[StateType] | undefined>
  : StateType extends IStateType[]
    ? W extends false
      ? Pick<State<V>, StateType[number]>
      : Record<string, Pick<State<V>, StateType[number]> | undefined>
    : W extends false
      ? State<V>
      : Record<string, State<any> | undefined>

export type WatchStateCallback<V, StateType extends (IStateType | IStateType[] | void), W> = (
  state: ResponseState<V, StateType, W>,
) => void

export interface CallbackBaseOptions {
  /**
   * @default false
   * 回调函数是否需要立即执行
   */
  immediate?: boolean
  /**
   * @default false
   * 默认多个同步更改只会触发一次更新
   * 当 sync 设置为 true 时，每次更改都会触发更新
   */
  sync?: boolean
}

export type WatchStateOptions<W extends boolean = false, State = any> = {
  /**
   * TODO WIP
   * @default false
   * 观察所有子节点 state 数据变更
   */
  withAllChildNodes?: W
  /**
   * TODO WIP
   * @default true
   * 当节点值触发更新时，是否需要对 preState, curState 进行 diff
   * 当 compare 为 true 时，会使用 [dequal](https://github.com/lukeed/dequal) 进行 diff
   * 当 compare 为 Function 时，返回值为 true 时才会触发更新 / callback 执行
   */
  compare?: boolean | ((preState: State, curState: State) => boolean)
} & CallbackBaseOptions

export type AtomType = 'normal' | 'list'

export type FormInstance<Value = any> = FormAtom<Value> | FormAtomArray<Value>

export interface Address {
  pathArray: (string | number)[]
  pathString: string
}
