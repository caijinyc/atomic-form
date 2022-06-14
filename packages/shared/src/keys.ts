export const Keys: <T = Record<string, any>>(obj: T) => (keyof T)[] = (obj) => {
  return Object.keys(obj as any) as any
}
