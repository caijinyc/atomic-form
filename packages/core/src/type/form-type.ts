import type { RuleItem } from 'async-validator/dist-types/interface'
import type { IStateType } from '../shared/get-state'
import type { FormAtom } from '../module'
import type { FormAtomArray } from '../module/array'
import type { FormAtomBase } from '../module/base'

export interface State<ValueType = any> {
  value: ValueType
  initialValue?: ValueType
  label: any
  visible: boolean
  disabled: boolean
  required?: boolean

  disableValidate: boolean
  initialized: boolean

  modified: boolean

  rules?: RuleItem[]
  error?: ErrorType

  // WIP
  validating: boolean
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

export type StopFun = () => void

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
  withAllChildren?: W
  /**
   * @default true
   * 当节点值触发更新时，是否需要对 preState, curState 进行 diff
   * 当 compare 为 true 时，会使用 [dequal](https://github.com/lukeed/dequal) 进行 diff
   * 当 compare 为 Function 时，返回值为 true 时才会触发更新 / callback 执行
   */
  compare?: boolean | ((preState: State, curState: State) => boolean)
} & CallbackBaseOptions

export type AtomType = 'normal' | 'list'

export type FormEntity<Value = any> = FormAtom<Value> | FormAtomArray<Value>

export interface Address {
  pathArray: (string | number)[]
  pathString: string
}
