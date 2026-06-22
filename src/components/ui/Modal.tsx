import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from './icons'
import { useBodyLock } from '../../hooks/useBodyLock'

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}) {
  useBodyLock(open, onClose)

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--ov)] p-[14px] animate-in"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-rx border border-bd bg-mod shadow-shx animate-in-scale ${size === 'lg' ? 'max-w-[680px]' : 'max-w-[500px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-bd px-[22px] pb-[14px] pt-[18px]">
          <h2 className="text-[15px] font-bold text-t1">{title}</h2>
          <button className="flex h-7 w-7 items-center justify-center rounded-full text-tm transition-colors hover:bg-bg hover:text-t1" onClick={onClose}>
            <IconX size={16} />
          </button>
        </div>
        <div className="px-[22px] py-[18px]">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-bd px-[22px] pb-[18px] pt-[14px]">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
