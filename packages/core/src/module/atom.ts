import { computed, ref } from '@vue/reactivity'
import { clone, isValid } from '@atomic-form/shared'
import { FORM_DEFAULT_VALUE } from '../shared/constants'
import type {
  IFormState,
  IPartialFormState,
  IResponseFormState,
  IStop,
  IWatchStateChangeCallback,
  IWatchStateChangeOptions,
} from '../type/form-type'
import { getIn, setIn } from '../shared/path'
import type { IFormAddress } from '../type'
import { watch } from '../watch'
import type { IStateType } from '../shared/get-state'
import { getState } from '../shared/get-state'
import { buildWatchStateChange } from '../shared/watch-state'
import { buildSetState } from '../shared'
import { FormState } from './state'

const countMap: Record<string, number> = {}
let rootFormCount = 0

function generateFormNodeUUID(form: FormAtom) {
  if (countMap[form.root.uuid])
    countMap[form.root.uuid]++
  else
    countMap[form.root.uuid] = 1

  return countMap[form.root.uuid]
}

export type DisposeChildValueType<T> = keyof T extends never ? Partial<Exclude<T, void>> : T

export class FormAtom<ValueType extends any = any, DV = DisposeChildValueType<ValueType>> extends FormState<ValueType> {
  isRoot = false
  root: FormAtom
  parent: FormAtom
  address: IFormAddress
  uuid: string

  constructor(props: {
    initialValue?: ValueType
    value?: ValueType
    path?: string | number
    rootNode?: FormAtom
    parentNode?: FormAtom
  }) {
    super()
    if (props.rootNode && props.parentNode) {
      // it means this is a sub form
      this.root = props.rootNode
      this.parent = props.parentNode
      this.uuid = `${this.root.uuid}-${generateFormNodeUUID(this)}`

      const pathArray = [...this.parent.address.pathArray, props.path]
      this.address = {
        pathArray,
        pathString: pathArray.join('/'),
      }

      this.value = computed({
        get: () => getIn(this.address.pathArray, this.root.value.value),
        set: (val) => {
          setIn(this.address.pathArray, this.root.value.value, val)
        },
      })
    }
    else {
      // it means this is a root form, so have to initialize the root form
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
          this.value.value = clone(this.initialValue.value)
      },
      { immediate: true, flush: 'sync' },
    )
  }

  get state(): IFormState<ValueType> {
    return getState(this)
  }

  watch<WithAllChildren extends boolean = false,
    State = IResponseFormState<DV, void, WithAllChildren>,
  >(
    callback: IWatchStateChangeCallback<DV, void, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch<StateType extends IStateType,
    WithAllChildren extends boolean = false,
    State = IResponseFormState<DV, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: IWatchStateChangeCallback<DV, StateType, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch<StateType extends IStateType[],
    WithAllChildren extends boolean = false,
    State = IResponseFormState<DV, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: IWatchStateChangeCallback<DV, StateType, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch(...params: any): any {
    return buildWatchStateChange(this, ...params)
  }

  setState(
    payload: IPartialFormState<ValueType> | ((oldState: IFormState<ValueType>) => IPartialFormState<ValueType>),
  ): this {
    return buildSetState(this, payload)
  }
}

//
