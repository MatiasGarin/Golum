import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBodyLock } from '../hooks/useBodyLock'

type ConfirmType = 'danger' | 'success'
interface ConfirmOpts {
  title: string
  msg: string
  cb: () => void
  type?: ConfirmType
}

const Ctx = createContext<((opts: ConfirmOpts) => void) | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmOpts | null>(null)

  const showConf = useCallback((opts: ConfirmOpts) => setState(opts), [])
  const close = useCallback(() => setState(null), [])
  const run = useCallback(() => {
    state?.cb()
    close()
  }, [state, close])

  useBodyLock(state !== null, close)

  const isDanger = (state?.type ?? 'danger') === 'danger'

  return (
    <Ctx.Provider value={showConf}>
      {children}
      {state && createPortal(
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[var(--ov)] p-[14px] animate-in">
          <div className="w-full max-w-[360px] rounded-rx border border-bd bg-mod px-[22px] pb-[22px] pt-[26px] text-center shadow-shx animate-in-scale">
            <div
              className="mx-auto mb-[14px] flex h-[52px] w-[52px] items-center justify-center rounded-full"
              style={{ background: isDanger ? 'var(--er-l)' : 'var(--ok-l)' }}
            >
              {isDanger ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <h3 className="mb-[7px] text-[16px] font-bold text-t1">{state.title}</h3>
            <p className="mb-[22px] text-[13px] leading-normal text-t2">{state.msg}</p>
            <div className="flex justify-center gap-2">
              <button className="btn-ol" onClick={close}>
                Cancelar
              </button>
              <button className={isDanger ? 'btn-er' : 'btn-ok'} onClick={run}>
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  )
}

export function useConfirm() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useConfirm must be used within ConfirmProvider')
  return v
}
