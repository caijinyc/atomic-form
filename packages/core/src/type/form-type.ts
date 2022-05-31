import { RuleItem } from "async-validator/dist-types/interface";

export interface IFormState<ValueType = any> {
  value: ValueType;
  initialValue?: ValueType;
  label: any;
  visible: boolean;
  disabled: boolean;
  required?: boolean;

  disableValidate: boolean;
  initialized: boolean;

  modified: boolean;

  rules?: RuleItem[];
  error?:ErrorType;

  // WIP
  validating: boolean;
}

export type ErrorType<V = any> = {
  status: 'success' | 'error' | 'warning';
  help: string[];
  /**
   * 节点字段，你使用 .node(field) 中填的就是
   * 例如 name 的表单路径为 `userInfo/name`
   * 它的节点字段为 name
   */
  field?: string;
  /**
   * 节点路径
   * 例如 userInfo.name 的表单路径为 `userInfo/name`
   */
  path?: string;
  /**
   * 校验触发时的表单值
   */
  value?: V;
};

