import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/DataContext'
import { EMP_ID } from '../../data/seed'
import { fd } from '../../lib/format'
import { pendienteDeResolucion, requiereAutorizacion } from '../../lib/novedad'
import { Avatar } from '../ui/Avatar'
import { StatusBadge, NovStatusBadge } from '../ui/Badge'
import { IconBell } from '../ui/icons'
import type { Employee } from '../../types'

interface NotifItem {
  key: string
  avatar?: Employee
  title: string
  sub: string
  badge?: React.ReactNode
  to: string
}

export function NotificationBell() {
  const { currentUser, novedades, solicitudes, gEmp } = useData()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const isAdmin = currentUser?.role === 'admin'
  let items: NotifItem[] = []

  if (isAdmin) {
    items = novedades
      .filter(pendienteDeResolucion)
      .sort((a, b) => b.d1.localeCompare(a.d1))
      .map((n) => {
        const e = gEmp(n.eId)!
        const accion = requiereAutorizacion(n.type) ? 'a autorizar' : 'justif. pendiente'
        return { key: `n${n.id}`, avatar: e, title: e.name, sub: `${n.type} · ${fd(n.d1)} · ${accion}`, to: '/admin/novedades' }
      })
  } else {
    const pend = novedades
      .filter((n) => n.eId === EMP_ID && pendienteDeResolucion(n))
      .sort((a, b) => b.d1.localeCompare(a.d1))
      .map<NotifItem>((n) => ({ key: `n${n.id}`, title: n.type, sub: `${fd(n.d1)} · ${n.qty}`, badge: <NovStatusBadge n={n} />, to: '/emp/novedades' }))
    const resueltas = solicitudes
      .filter((s) => s.eId === EMP_ID && s.st !== 'pendiente')
      .map<NotifItem>((s) => ({ key: `s${s.id}`, title: s.type, sub: `Respuesta del admin · ${fd(s.sentAt)}`, badge: <StatusBadge st={s.st} />, to: '/emp/solicitudes' }))
    items = [...pend, ...resueltas]
  }

  const count = items.length

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notificaciones"
        className="relative flex h-[34px] w-[34px] items-center justify-center rounded-md border border-bd bg-card text-t2 transition-all hover:bg-bg hover:text-t1"
      >
        <IconBell size={15} />
        {count > 0 && (
          <span className="absolute -right-[6px] -top-[6px] flex h-[17px] min-w-[17px] items-center justify-center rounded-rf border-2 border-card bg-er px-[3px] text-[9px] font-bold leading-none text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[340px] max-w-[88vw] overflow-hidden rounded-rl border border-bd bg-card shadow-shl anim-fsi">
          <div className="flex items-center justify-between border-b border-bd px-[16px] py-[12px]">
            <span className="text-[13px] font-bold text-t1">Notificaciones</span>
            <span className="text-[11px] text-tm">{count} pendiente{count !== 1 ? 's' : ''}</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {count === 0 ? (
              <div className="empty">
                <div className="empty-ico"><IconBell size={22} /></div>
                <div className="empty-t">Sin notificaciones</div>
                <p>Estás al día.</p>
              </div>
            ) : (
              items.map((it) => (
                <button key={it.key} onClick={() => go(it.to)} className="ql w-full text-left">
                  {it.avatar ? (
                    <Avatar emp={it.avatar} />
                  ) : (
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-pu-l text-pu"><IconBell size={15} /></div>
                  )}
                  <div className="ql-inf">
                    <div className="ql-n">{it.title}</div>
                    <div className="ql-d">{it.sub}</div>
                  </div>
                  {it.badge}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
