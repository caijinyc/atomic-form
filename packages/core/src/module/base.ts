import type { Ref } from '@vue/reactivity'
import { computed, ref } from '@vue/reactivity'
import { Keys, clone, isValid } from '@atomic-form/shared'
import { getIn, setIn } from '../shared/path'
import { FORM_DEFAULT_STATE } from '../shared/constants'
import type {
  Address,
  FormInstance,
  HandleStop,
  PartialState,
  ResponseState,
  State,
  WatchStateCallback,
  WatchStateOptions,
} from '../type'
import type { IStateType } from '../shared/get-state'
import { getState } from '../shared/get-state'
import { buildWatchStateChange } from '../shared/watch-state'
import { watch } from '../watch'
import { buildGetAllChildren, buildSetState, generatePathString } from '../shared'
import type { FormAtom, FormProps, GetChildValue } from './atom'

const ROOT_PATH = '__ROOT__'
const countMap: Record<string, number> = {}
let rootFormCount = 0
function genFormRootUUID() {
  return `ROOT-${rootFormCount++}`
}
function genFormNodeUUID(form: FormAtomBase) {
  const rootUID = form.root.uuid
  if (countMap[rootUID])
    countMap[rootUID]++
  else
    countMap[rootUID] = 1
  return `${rootUID}-${countMap[rootUID]}`
}

export class FormAtomBase<V = any, PV = GetChildValue<V>> {
  private initialValue: Ref<V> = ref(FORM_DEFAULT_STATE.initialValue)
  private value: Ref<V> = ref(FORM_DEFAULT_STATE.initialValue)
  private label: Ref<State['label']> = ref(FORM_DEFAULT_STATE.label)
  private visible: Ref<State['visible']> = ref(FORM_DEFAULT_STATE.visible)
  private disabled: Ref<State['disabled']> = ref(FORM_DEFAULT_STATE.disabled)
  private initialized: Ref<State['initialized']> = ref(FORM_DEFAULT_STATE.initialized)
  private modified: Ref<State['modified']> = ref(FORM_DEFAULT_STATE.modified)
  private required: Ref<State['required']> = ref(FORM_DEFAULT_STATE.required)
  private rules: Ref<State['rules']> = ref(FORM_DEFAULT_STATE.rules)
  private error: Ref<State['error']> = ref(FORM_DEFAULT_STATE.error)
  private disableValidate: Ref<State['disableValidate']> = ref(FORM_DEFAULT_STATE.disableValidate)
  // WIP
  private validating: Ref<State['validating']> = ref(FORM_DEFAULT_STATE.validating)
  // component: Ref<IComponent | undefined> = ref(undefined);
  // decorator: Ref<IComponent | undefined> = ref(undefined);

  root: FormAtomBase
  parent: FormAtomBase
  children: Record<string, any> | Array<any> = {}
  isRoot = false
  address: Address
  uuid: string
  #watchStopFunList: Array<() => void> = []

  constructor(props: FormProps<V>) {
    if (props.rootNode && props.parentNode) {
      // it means this is a sub form
      this.root = props.rootNode
      this.parent = props.parentNode
      this.uuid = genFormNodeUUID(this)

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
      this.uuid = genFormRootUUID()
      this.root = this
      this.parent = this
      this.initialValue = ref(isValid(props.initialValue) ? props.initialValue : FORM_DEFAULT_STATE.initialValue)
      this.value = ref(isValid(props.value) ? props.value : clone(this.initialValue.value))

      this.address = {
        pathArray: [ROOT_PATH],
        pathString: ROOT_PATH,
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

  get state(): State<PV> {
    return getState(this)
  }

  setState(
    payload: PartialState<V> | ((oldState: State<V>) => PartialState<V>),
  ): this {
    return buildSetState(this, payload)
  }

  setValue(
    payload: V | ((oldValue: V) => V),
  ): this {
    return buildSetState(this, {
      value: payload,
    })
  }

  watch<W extends boolean = false,
    State = ResponseState<PV, void, W>,
  >(
    callback: WatchStateCallback<PV, void, W>,
    options?: WatchStateOptions<W, State>,
  ): HandleStop

  watch<StateType extends IStateType,
    W extends boolean = false,
    State = ResponseState<PV, StateType, W>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<PV, StateType, W>,
    options?: WatchStateOptions<W, State>,
  ): HandleStop

  watch<StateType extends IStateType[],
    W extends boolean = false,
    State = ResponseState<PV, StateType, W>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<PV, StateType, W>,
    options?: WatchStateOptions<W, State>,
  ): HandleStop

  watch(...params: any): any {
    const stop = buildWatchStateChange(this, ...params)
    this.#watchStopFunList.push(stop)
    return stop
  }

  get allChildren(): FormInstance[] {
    return buildGetAllChildren(this)
  }

  get allParent(): FormInstance[] {
    if (this.isRoot) return [] as any
    const parent = this.parent as FormAtom
    return [parent, ...parent.allParent]
  }

  stopWatch(option?: {
    withAllChildNodes?: boolean
  }) {
    this.#watchStopFunList.forEach(stop => stop())
    if (option?.withAllChildNodes)
      this.allChildren.forEach(child => child.stopWatch({ withAllChildNodes: true }))
  }

  initialize(originProps: PartialState<V>) {
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
