import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

// Namespace base del demo (estable entre versiones).
export const STORE_NS = 'golum:'
// Prefijo versionado: subir la versión invalida cualquier estado guardado con
// un esquema viejo (evita romper la app si cambian las formas del seed).
export const STORE_PREFIX = STORE_NS + 'v2:'

/**
 * useState que se persiste en localStorage bajo `STORE_PREFIX + key`.
 * Restaura el valor guardado en el primer render; si no hay (o falla el parseo)
 * usa `initial()`. Tolera localStorage deshabilitado (modo privado): degrada a
 * estado en memoria sin romper.
 */
export function usePersistentState<T>(key: string, initial: () => T): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = STORE_PREFIX + key
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw != null) return JSON.parse(raw) as T
    } catch {
      /* localStorage no disponible o JSON inválido: usar el inicial */
    }
    return initial()
  })

  // Evita reescribir en el primer render (el valor ya viene de storage o del inicial).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* sin persistencia: no es fatal para el demo */
    }
  }, [storageKey, state])

  return [state, setState]
}

/**
 * Borra todo el estado persistido del demo (útil para reset). Limpia el namespace
 * completo (`golum:`), no sólo la versión actual, para que el reset funcione aunque
 * hayan quedado claves de un esquema anterior (`golum:v1:`, etc.).
 */
export function clearPersistedState() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith(STORE_NS)) localStorage.removeItem(k)
    }
  } catch {
    /* no-op */
  }
}
