import { isNum, isValid } from '@atomic-form/shared'
import type { Address } from '../type/form-type'

export const setIn = (pathArray: Address['pathArray'], source: any, value: any) => {
  const arr = [...pathArray]
  for (let i = 0; i < arr.length; i++) {
    const path = arr[i]
    if (!isValid(source))
      return

    if (!isValid(source[path])) {
      if (!isValid(value))
        return

      if (i < arr.length - 1)
        source[path] = isNum(arr[i + 1]) ? [] : {}
    }
    if (i === arr.length - 1)
      source[path] = value
    else
      source = source[path]
  }
}

export const getIn = (pathArray: Address['pathArray'], source: any) => {
  const arr = [...pathArray]
  for (let i = 0; i < arr.length; i++) {
    if (!isValid(source))
      return source

    const path = arr[i]

    if (i === arr.length - 1)
      return source[path]
    else
      source = source[path]
  }
  return source
}
