import { computed, ref } from '@vue/reactivity'
import { Keys, clone, isValid } from '@atomic-form/shared'
import { getIn, setIn } from '../shared/path'
import { FORM_DEFAULT_VALUE } from '../shared/constants'
import type {
  Address,
  FormInstance,
  PartialState,
  ResponseState,
  State,
  StopFun,
  WatchStateCallback,
  WatchStateOptions,
} from '../type/form-type'
import type { IStateType } from '../shared/get-state'
import { getState } from '../shared/get-state'
import { buildWatchStateChange } from '../shared/watch-state'
import { buildSetState } from '../shared'
import { watch } from '../watch'
import { buildGetAllChildren, generatePathString } from '../shared/internal'
import { FormState } from './state'
import type { FormProps, ProcessChildValueType } from './atom'

const countMap: Record<string, number> = {}
let rootFormCount = 0

export class FormAtomBase<Value = any, ProcessedValue = ProcessChildValueType<Value>> extends FormState<Value> {
  private _watchStopFunList: Array<() => void> = []
  children: Record<string, any> | Array<any> = {}

  isRoot = false
  root: FormAtomBase
  parent: FormAtomBase
  address: Address
  uuid: string

  constructor(props: FormProps<Value>) {
    super()
    if (props.rootNode && props.parentNode) {
      // it means this is a sub form
      this.root = props.rootNode
      this.parent = props.parentNode
      this.uuid = `${this.root.uuid}-${generateFormNodeUUID(this)}`

      const pathArray = [...this.parent.address.pathArray, props.path === undefined ? '' : props.path]
      this.address = {
        pathArray,
        pathString: generatePathString(pathArray),
      }

      this.value = computed({
        get: () => getIn(this.address.pathArray.slice(1), this.root.value.value),
        set: (val) => {
          setIn(this.address.pathArray.slice(1), this.root.value.value, val)
        },
      })
    }
    else {
      // root form, must initialize the root form
      this.isRoot = true
      this.uuid = `ROOT-${rootFormCount++}`
      this.root = this
      this.parent = this
      this.initialValue = ref(isValid(props.initialValue) ? props.initialValue : FORM_DEFAULT_VALUE.initialValue)
      this.value = ref(isValid(props.value) ? props.value : clone(this.initialValue.value))

      this.address = {
        pathArray: ['__ROOT__'],
        pathString: '__ROOT__',
      }
    }

    watch(
      () => this.initialValue.value,
      (value) => {
        if (
          !this.state.initialized
          && isValid(this.state.initialValue)
          && !isValid(this.state.value)
        )
          this.value.value = clone(value)
      },
      { immediate: true, flush: 'sync' },
    )
  }

  get state(): State<ProcessedValue> {
    return getState(this)
  }

  setState(
    payload: PartialState<Value> | ((oldState: State<Value>) => PartialState<Value>),
  ): this {
    return buildSetState(this, payload)
  }

  setValue(
    payload: Value | ((oldValue: Value) => Value),
  ): this {
    return buildSetState(this, {
      value: payload,
    })
  }

  watch<WithAllChildren extends boolean = false,
    State = ResponseState<ProcessedValue, void, WithAllChildren>,
  >(
    callback: WatchStateCallback<ProcessedValue, void, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

  watch<StateType extends IStateType,
    WithAllChildren extends boolean = false,
    State = ResponseState<ProcessedValue, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<ProcessedValue, StateType, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

  watch<StateType extends IStateType[],
    WithAllChildren extends boolean = false,
    State = ResponseState<ProcessedValue, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<ProcessedValue, StateType, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

  watch(...params: any): any {
    const stop = buildWatchStateChange(this, ...params)
    this._watchStopFunList.push(stop)
    return stop
  }

  get allChildren(): FormInstance[] {
    return buildGetAllChildren(this)
  }

  stopWatch(option?: {
    withAllChildren?: boolean
  }) {
    this._watchStopFunList.forEach(stop => stop())
    if (option?.withAllChildren)
      this.allChildren.forEach(child => child.stopWatch({ withAllChildren: true }))
  }

  initialize(originProps: PartialState<Value>) {
    const props = { ...originProps }
    if (
      isValid(props.initialValue)
      && !Keys(props).includes('value')
      && !isValid(this.state.value)
    )
      props.value = props.initialValue

    this.setState(
      {
        ...props,
        initialized: true,
      },
    )
  }
}

function generateFormNodeUUID(form: FormAtomBase) {
  if (countMap[form.root.uuid])
    countMap[form.root.uuid]++
  else
    countMap[form.root.uuid] = 1

  return countMap[form.root.uuid]
}
