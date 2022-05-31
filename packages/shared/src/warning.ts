import { IForm, isRootForm, INTERNAL_LOG } from '@ecom-zform/core';

export const warning = (valid: boolean, message: string): void => {
  // Support uglify
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    // eslint-disable-next-line no-console
    console.error('Warning: '.concat(message));
  }
};

const prefix = (component: string, form?: IForm) =>
  `[ZForm:${component}]${form ? `[path:${isRootForm(form) ? 'root' : form.address.string}]` : ''}`;

export const devWarning = (
  valid: boolean,
  component: string,
  message: string,
  form?: IForm,
): void => {
  if (message.includes(INTERNAL_LOG)) return;
  warning(valid, `${prefix(component, form)} ${message}`);
};

export const devError = (
  valid: boolean,
  component: string,
  message: string,
  form?: IForm,
): void => {
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    throw Error(`${prefix(component, form)} ${message}`);
  }
};

export const devLog = (component: string, message: string, form?: IForm): void => {
  if (message.includes(INTERNAL_LOG)) return;
  if (process.env.NODE_ENV !== 'production' && console !== undefined) {
    // eslint-disable-next-line no-console
    console.log(`LOG: ${prefix(component, form)} ${message}`);
  }
};
