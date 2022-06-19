import { useRef } from 'react'
import { createForm } from '@atomic-form/core'

/**
 * useForm help you easily create a form in your React component
 * @param props
 */
export function useForm<Value>(props: Parameters<typeof createForm<Value>>[0],
): ReturnType<typeof createForm<Value>> {
  const ref = useRef(createForm(props))
  return ref.current
}
