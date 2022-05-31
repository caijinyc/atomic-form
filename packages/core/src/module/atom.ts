import { computed, ref, Ref } from "@vue/reactivity";
import { FORM_DEFAULT_VALUE } from "../shared/constants";
import { IFormState } from "../type/form-type";
import { clone, isValid } from "@atomic-form/shared";
import { getIn, setIn } from "../shared/path";
import { IFormAddress } from "../type";

function generateID (form: FormAtom) {

}

class FormState<ValueType extends any> {
  initialValue: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)
  value: Ref<ValueType> = ref(FORM_DEFAULT_VALUE.initialValue)

  label: Ref<any> = ref(FORM_DEFAULT_VALUE.label);
  visible: Ref<boolean> = ref(FORM_DEFAULT_VALUE.visible);
  disabled: Ref<boolean> = ref(FORM_DEFAULT_VALUE.disabled);

  initialized: Ref<boolean> = ref(FORM_DEFAULT_VALUE.initialized);
  modified: Ref<boolean> = ref(FORM_DEFAULT_VALUE.modified);
  required: Ref<boolean | undefined> = ref(FORM_DEFAULT_VALUE.required);
  rules: Ref<IFormState["rules"]> = ref(FORM_DEFAULT_VALUE.rules);
  error: Ref<IFormState["error"]> = ref(FORM_DEFAULT_VALUE.error);
  disableValidate: Ref<boolean> = ref(FORM_DEFAULT_VALUE.disableValidate);

  // WIP
  // validating: Ref<boolean> = ref(FORM_DEFAULT_VALUE.validating);
  // component: Ref<IComponent | undefined> = ref(undefined);
  // decorator: Ref<IComponent | undefined> = ref(undefined);
}


class FormAtom<ValueType extends any = any> extends FormState<ValueType>{
  isRoot: boolean = false;
  root: FormAtom;
  parent?: FormAtom;
  address: IFormAddress;

  constructor(props: {
    initialValue?: ValueType;
    value?: ValueType;
    path: string | number,
    rootNode?: FormAtom
    parentNode?: FormAtom;
  }) {
    super();
    if (props.rootNode && props.parentNode) {
      // it means this is a sub form
      this.root = props.rootNode;
      this.parent = props.parentNode;

      const pathArr = [...this.parent.address.pathArray, props.path];
      this.address = {
        pathArray: pathArr,
        pathString: pathArr.join('/'),
      };
      this.value = computed({
        get: () => getIn(this.address.pathArray, this.root.value.value),
        set: (val) => {
          setIn(this.address.pathArray, this.root.value.value, val);
        },
      });
    } else {
      // it means this is a root form, so have to initialize the root form
      this.root = this;
      this.isRoot = true;
      this.initialValue = ref(isValid(props.initialValue) ? props.initialValue : FORM_DEFAULT_VALUE.initialValue);
      this.value = ref(isValid(props.value) ? props.value : clone(this.initialValue));

      this.address = {
        pathArray: ['__ROOT__'],
        pathString: '__ROOT__',
      };
    }
  }

}

//
