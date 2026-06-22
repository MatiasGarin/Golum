import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

export type ToastType = 'ok' | 'er' | 'in' | 'wa'
interface ToastItem {
  id: number
  msg: string
  type: ToastType
  out: boolean
}

const Ctx = createContext<((msg: string, type?: ToastType) => void) | null>(null)

const ICONS: Record<ToastType, ReactNode> = {
  ok: <polyline points="20 6 9 17 4 12" />,
  er: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  in: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  wa: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
}

const ICON_BG: Record<ToastType, string> = {
  ok: 'bg-ok-l text-ok',
  er: 'bg-er-l text-er',
  in: 'bg-in-l text-in',
  wa: 'bg-wa-l text-wa',
}
const BAR_BG: Record<ToastType, string> = { ok: 'bg-ok', er: 'bg-er', in: 'bg-in', wa: 'bg-wa' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(1)

  const toast = useCallback((msg: string, type: ToastType = 'ok') => {
    const id = idRef.current++
    setItems((prev) => [...prev, { id, msg, type, out: false }])
    setTimeout(() => {
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, out: true } : t)))
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 300)
    }, 3000)
  }, [])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed bottom-[22px] right-[22px] z-[9999] flex flex-col gap-[7px] pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`relative overflow-hidden flex items-center gap-[9px] min-w-[260px] max-w-[340px] rounded-rl border border-bd bg-card px-[14px] py-[11px] text-[13px] font-medium text-t1 shadow-shl pointer-events-auto ${t.out ? 'anim-tout' : 'anim-tin'}`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${BAR_BG[t.type]}`} />
            <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${ICON_BG[t.type]}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {ICONS[t.type]}
              </svg>
            </div>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToast must be used within ToastProvider')
  return v
}
