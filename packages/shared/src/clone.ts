import { isPlainObj } from './check'

export const clone = (values: any) => {
  if (Array.isArray(values)) {
    const res: any = []
    values.forEach((item) => {
      res.push(clone(item))
    })
    return res
  }
  else if (isPlainObj(values)) {
    // React Node
    if ('$$typeof' in values && '_owner' in values)
      return values

    // Moment Object
    if ((values as any)._isAMomentObject)
      return values

    const res: any = {}
    for (const key in values) {
      if (Object.hasOwnProperty.call(values, key))
        res[key] = clone((values as any)[key])
    }
    return res
  }
  else {
    return values
  }
}
