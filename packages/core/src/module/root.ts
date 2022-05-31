import { ref, Ref } from "@vue/reactivity";
import { FORM_DEFAULT_VALUE } from "../shared/constants";
import { FormState } from "../type/form-type";
import { FormCommonState } from "./base";
import { clone, isValid } from "@atomic-form/shared";

class FormRoot<ValueType extends any> extends FormCommonState<ValueType>{
  constructor(props: {
    initialValue?: ValueType;
    value?: ValueType;
  }) {
    super();
    this.initialValue = ref(isValid(props.initialValue) ? props.initialValue : FORM_DEFAULT_VALUE.initialValue);
    this.value = ref(isValid(props.value) ? props.value : clone(this.initialValue));
  }
}
