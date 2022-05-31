import { isValid } from './check';

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K> {
  const res: any = {};

  if (Array.isArray(fields)) {
    fields.forEach((key) => {
      res[key] = obj[key];
    });
  }

  return res;
}
