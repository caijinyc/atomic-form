export const getType = (obj: any) => Object.prototype.toString.call(obj)

export const isType
  = <T>(type: string | string[]) =>
    (obj: unknown): obj is T =>
      getType(obj) === `[object ${type}]`
// toString() 的应用：判断数据类型（因为 Array, String 等）
// https://wangdoc.com/javascript/stdlib/object.html#tostring

export const isMap = isType<Map<any, any>>('Map')
export const isSet = isType<Set<any>>('Set')
export const isArray = Array.isArray

export const isFunction = (val: any): val is Function => typeof val === 'function'
export const isPlainObject = isType<object>('Object')
export const isString = isType<string>('String')
export const isBool = isType<boolean>('Boolean')
export const isNum = isType<boolean>('Number')
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const isValid = (val: any) => val !== undefined && val !== null

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}
