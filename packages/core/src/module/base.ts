import type { Ref } from '@vue/reactivity'
import { computed, ref } from '@vue/reactivity'
import { Keys, clone, isValid } from '@atomic-form/shared'
import { getIn, setIn } from '../shared/path'
import { FORM_DEFAULT_STATE } from '../shared/constants'
import type {
  Address,
  FormInstance,
  PartialState,
  ResponseState,
  State,
  StopFun,
  WatchStateCallback,
  WatchStateOptions,
} from '../type'
import type { IStateType } from '../shared/get-state'
import { getState } from '../shared/get-state'
import { buildWatchStateChange } from '../shared/watch-state'
import { watch } from '../watch'
import { buildGetAllChildren, buildSetState, generatePathString } from '../shared'
import type { FormAtom, FormProps, ProcessChildValueType } from './atom'

const countMap: Record<string, number> = {}
let rootFormCount = 0

export class FormAtomBase<V = any, PV = ProcessChildValueType<V>> {
  /**
   * when you set initialValue and value is invalid, it will be set to value
   */
  initialValue: Ref<V> = ref(FORM_DEFAULT_STATE.initialValue)
  /**
   * just form value
   * Tip:
   *   Parent Atom value includes all children's value
   *   so, if you set parent atom value, it will also set children's value
   *   if you set children's value, it will also set parent atom value
   */
  value: Ref<V> = ref(FORM_DEFAULT_STATE.initialValue)
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
      this.initialValue = ref(isValid(props.initialValue) ? props.initialValue : FORM_DEFAULT_STATE.initialValue)
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

  watch<WithAllChildren extends boolean = false,
    State = ResponseState<PV, void, WithAllChildren>,
  >(
    callback: WatchStateCallback<PV, void, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

  watch<StateType extends IStateType,
    WithAllChildren extends boolean = false,
    State = ResponseState<PV, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<PV, StateType, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

  watch<StateType extends IStateType[],
    WithAllChildren extends boolean = false,
    State = ResponseState<PV, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: WatchStateCallback<PV, StateType, WithAllChildren>,
    options?: WatchStateOptions<WithAllChildren, State>,
  ): StopFun

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
    withAllChildren?: boolean
  }) {
    this.#watchStopFunList.forEach(stop => stop())
    if (option?.withAllChildren)
      this.allChildren.forEach(child => child.stopWatch({ withAllChildren: true }))
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

function generateFormNodeUUID(form: FormAtomBase) {
  if (countMap[form.root.uuid])
    countMap[form.root.uuid]++
  else
    countMap[form.root.uuid] = 1

  return countMap[form.root.uuid]
}
