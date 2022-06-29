export * from './check'
export * from './clone'
export * from './omit'
export * from './pick'
// export * from './warning'
export * from './keys'
export * from './array'
export * from './next-tick'
export * from './is-equal'

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const toNumber = (val: any): any => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}
export const NOOP = () => {}
