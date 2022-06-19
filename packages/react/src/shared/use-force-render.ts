import { useState } from 'react'

export function useForceRender() {
  const [, updateCount] = useState({})
  return () => {
    updateCount({})
  }
}
