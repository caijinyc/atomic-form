export const isType
  = <T>(type: string | string[]) =>
    (obj: unknown): obj is T =>
      getType(obj) === `[object ${type}]`
// toString() 的应用：判断数据类型（因为 Array, String 等）
// https://wangdoc.com/javascript/stdlib/object.html#tostring
export const getType = (obj: any) => Object.prototype.toString.call(obj)
export const isFn = (val: any): val is Function => typeof val === 'function'
export const isPlainObj = isType<object>('Object')
export const isStr = isType<string>('String')
export const isBool = isType<boolean>('Boolean')
export const isNum = isType<boolean>('Number')
export const isArr = Array.isArray
export const isValid = (val: any) => val !== undefined && val !== null
