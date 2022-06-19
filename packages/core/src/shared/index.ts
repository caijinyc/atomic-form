import { nextTick } from '@atomic-form/shared'

export { buildGetAllChildren, buildSetState, buildNode, triggerModified, generatePathString } from './internal'

// export const buildLazyCallback = (originCb: (...args: any) => any) => {
//   let count = 0
//   return async(state?: any) => {
//     const currentCount = count++
//     await nextTick()
//     if (currentCount === count - 1) {
//       count = 0
//       originCb(state)
//     }
//   }
// }
