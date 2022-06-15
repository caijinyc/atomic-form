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

function generateFormNodeUUID(form: FormAtomBase) {
  if (countMap[form.root.uuid])
    countMap[form.root.uuid]++
  else
    countMap[form.root.uuid] = 1

  return countMap[form.root.uuid]
}

export type ProcessChildValueType<T> = keyof T extends never ? Partial<Exclude<T, void>> : T

export interface FormProps<Value = any> {
  initialValue?: Value
  value?: Value
  path?: string | number
  rootNode?: FormAtomBase
  parentNode?: FormAtomBase
}

export class FormAtomBase<Value = any, ProcessedValue = ProcessChildValueType<Value>> extends FormState<Value> {
  isRoot = false
  root: FormAtomBase
  parent: FormAtomBase
  address: IFormAddress
  uuid: string

  constructor(props: FormProps<Value>) {
    super()
    if (props.rootNode && props.parentNode) {
      // it means this is a sub form
      this.root = props.rootNode
      this.parent = props.parentNode
      this.uuid = `${this.root.uuid}-${generateFormNodeUUID(this)}`

      const pathArray = [...this.parent.address.pathArray, props.path || '']
      this.address = {
        pathArray,
        pathString: pathArray.join('/'),
      }

      const removeRootAddress = this.address.pathArray.slice(1)
      this.value = computed({
        get: () => getIn(removeRootAddress, this.root.value.value),
        set: (val) => {
          setIn(removeRootAddress, this.root.value.value, val)
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
          this.value.value = clone(this.initialValue.value)
      },
      { immediate: true, flush: 'sync' },
    )
  }

  get state(): IFormState<Value> {
    return getState(this)
  }

  watch<WithAllChildren extends boolean = false,
    State = IResponseFormState<ProcessedValue, void, WithAllChildren>,
  >(
    callback: IWatchStateChangeCallback<ProcessedValue, void, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch<StateType extends IStateType,
    WithAllChildren extends boolean = false,
    State = IResponseFormState<ProcessedValue, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: IWatchStateChangeCallback<ProcessedValue, StateType, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch<StateType extends IStateType[],
    WithAllChildren extends boolean = false,
    State = IResponseFormState<ProcessedValue, StateType, WithAllChildren>,
  >(
    stateType: StateType,
    callback: IWatchStateChangeCallback<ProcessedValue, StateType, WithAllChildren>,
    options?: IWatchStateChangeOptions<WithAllChildren, State>,
  ): IStop

  watch(...params: any): any {
    return buildWatchStateChange(this, ...params)
  }

  setState(
    payload: IPartialFormState<Value> | ((oldState: IFormState<Value>) => IPartialFormState<Value>),
  ): this {
    return buildSetState(this, payload)
  }
}

export class FormAtom<Value = any, ProcessedValue = ProcessChildValueType<Value>> extends FormAtomBase<Value> {
  children: Record<keyof ProcessedValue, FormAtom> = {} as any
  node<
    Path extends Exclude<keyof ProcessedValue, Symbol>,
    Type extends 'normal' | 'list' = 'normal',
  >(path: Path, type?: Type): Type extends 'list' ? FormAtom<ProcessedValue[Path]> : FormAtom<ProcessedValue[Path]> {
    if (!this.children[path]) {
      this.children[path] = new FormAtom<Value, ProcessedValue>({
        path,
        rootNode: this.root,
        parentNode: this,
      })
    }
    return this.children[path] as FormAtom<ProcessedValue[Path]>
  }
}
