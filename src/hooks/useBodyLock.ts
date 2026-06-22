import { useEffect, useRef } from 'react'

export function useBodyLock(active: boolean, onEscape?: () => void) {
  const cb = useRef(onEscape)
  cb.current = onEscape

  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  useEffect(() => {
    if (!active || !cb.current) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [active])
}
