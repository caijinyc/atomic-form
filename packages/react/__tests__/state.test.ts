import { describe, expect, test } from 'vitest'

test('should works get state', () => {
  const add = (a: number, b: number) => a + b
  expect(add(1, 2)).toBe(3)
})
