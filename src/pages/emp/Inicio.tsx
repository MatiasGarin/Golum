import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { EMP_ID } from '../../data/seed'
import { fd, novTip, p2, shiftSummary } from '../../lib/format'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { MetricCard } from '../../components/ui/MetricCard'
import { IconCalendar, IconAlertCircle, IconBell, IconLogin, IconLogout, IconClock, IconCheck } from '../../components/ui/icons'
import type { FichType } from '../../types'

export function Inicio() {
  const { fichadas, novedades, emps, eState, eEntry, eExit, eBreakStart, fichar, gShift } = useData()
  const myShift = gShift(emps.find((e) => e.id === EMP_ID)?.sid ?? -1)
  const toast = useToast()
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(`${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const empNovs = novedades.filter((n) => n.eId === EMP_ID)
  const pendNovs = empNovs.filter((n) => n.st === 'pendiente')
  const mTard = empNovs.filter((n) => n.d1.startsWith('2026-06') && n.type === 'Tardanza').length
  const mDias = fichadas.filter((f) => f.eId === EMP_ID && f.type === 'entrada' && f.dt.startsWith('2026-06')).length
  const lastFichs = [...fichadas].filter((f) => f.eId === EMP_ID && f.type === 'entrada').sort((a, b) => b.dt.localeCompare(a.dt)).slice(0, 5)
  const lastNovs = [...empNovs].sort((a, b) => b.d1.localeCompare(a.d1)).slice(0, 4)

  const stMsg =
    eState === 'en-jornada'
      ? `Jornada activa desde las ${eEntry}`
      : eState === 'en-descanso'
        ? `En descanso desde las ${eBreakStart}`
        : eState === 'jornada-completa'
          ? `Jornada completa: ${eEntry} – ${eExit}`
          : 'Sin entrada registrada hoy'

  const doFichar = (tipo: FichType, hora: string, esAhora: boolean) => {
    const res = fichar(tipo, hora)
    if (res.type === 'entrada') {
      if (res.tardanza) toast(`Entrada registrada. Tardanza de ${res.tardanza} min generada automáticamente.`, 'wa')
      else toast(`Entrada registrada${esAhora ? '' : ' con hora ' + hora}. ¡Buen día!`, 'ok')
    } else if (res.type === 'inicio-descanso') {
      toast(`Descanso iniciado a las ${hora}. ¡Buen provecho!`, 'ok')
    } else if (res.type === 'fin-descanso') {
      if (res.excesoDescanso) toast(`Descanso finalizado. Exceso de ${res.excesoDescanso} min registrado.`, 'wa')
      else toast('Descanso finalizado. ¡A seguir!', 'ok')
    } else {
      if (res.salidaAnticipada) toast(`Salida registrada. Salida anticipada de ${res.salidaAnticipada} min registrada.`, 'wa')
      else if (res.sinDescanso) toast('Salida registrada. Atención: jornada sin descanso registrado.', 'wa')
      else if (res.horasExtra) toast(`Salida registrada. Horas extra de ${res.horasExtra} min generadas.`, 'wa')
      else toast('Salida registrada. ¡Hasta mañana!', 'ok')
    }
  }

  const ficharAhora = (tipo: FichType) => {
    const now = new Date()
    doFichar(tipo, `${p2(now.getHours())}:${p2(now.getMinutes())}`, true)
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Buenos días, Juan 👋</div>
          <div className="ph-s">Miércoles, 18 de junio de 2026{myShift ? ` · ${myShift.name} (${shiftSummary(myShift)})` : ''}</div>
        </div>
      </div>

      {/* Fichaje panel */}
      <div className="relative mb-5 overflow-hidden rounded-rx p-[26px] text-white" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
        <div className="absolute -right-[35px] -top-[35px] h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-[55px] right-[55px] h-[200px] w-[200px] rounded-full bg-white/[0.03]" />
        <div className="relative z-[1] mb-[3px] text-[44px] font-extrabold leading-none tracking-[-2px]">{clock}</div>
        <div className="relative z-[1] mb-4 text-[13px] text-white/70">Miércoles, 18 de junio de 2026</div>
        <div className="relative z-[1] mb-[14px] flex items-center gap-[7px] text-[13px] font-medium">
          <div className={`pulse ${eState === 'en-jornada' ? '' : 'off'}`} />
          <span>{stMsg}</span>
        </div>
        <div className="relative z-[1] flex flex-wrap gap-2">
          {eState === 'sin-entrada' && (
            <button className="btn-f btn-f-pr" onClick={() => ficharAhora('entrada')}><IconLogin size={15} />Fichar entrada</button>
          )}
          {eState === 'en-jornada' && (
            <>
              <button className="btn-f btn-f-pr" onClick={() => ficharAhora('salida')}><IconLogout size={15} />Fichar salida</button>
              <button className="btn-f btn-f-se" onClick={() => ficharAhora('inicio-descanso')}><IconClock size={15} />Iniciar almuerzo</button>
            </>
          )}
          {eState === 'en-descanso' && (
            <button className="btn-f btn-f-pr" onClick={() => ficharAhora('fin-descanso')}><IconLogin size={15} />Volver de almuerzo</button>
          )}
          {eState === 'jornada-completa' && (
            <button className="btn-f btn-f-dis" disabled><IconCheck size={15} />Jornada completa · {eEntry} – {eExit}</button>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
        <MetricCard color="bl" icon={<IconCalendar size={19} />} label="Días trabajados" value={mDias} sub="en junio 2026" tip="Días con al menos una fichada de entrada en el mes actual." />
        <MetricCard color="am" icon={<IconAlertCircle size={19} />} label="Tardanzas" value={mTard} sub="este mes" tip="Tardanzas: entradas que superaron la tolerancia de tu turno." />
        <MetricCard
          color="pu"
          icon={<IconBell size={19} />}
          label="Nov. pendientes"
          value={pendNovs.length}
          sub={<Link to="/emp/novedades" className="text-pr">Ver →</Link>}
          tip="Novedades tuyas que aún no fueron aprobadas o rechazadas por el administrador."
        />
      </div>

      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        <div className="card">
          <div className="ch"><span className="cht">Últimas asistencias</span><Link to="/emp/asistencia" className="btn-gh btn-sm">Ver todas →</Link></div>
          {lastFichs.map((f) => {
            const [date, time] = f.dt.split(' ')
            const ex = fichadas.find((x) => x.eId === EMP_ID && x.type === 'salida' && x.dt.startsWith(date))
            const tard = novedades.find((n) => n.eId === EMP_ID && n.d1 === date && n.type === 'Tardanza')
            return (
              <div className="ql" key={f.id}>
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: tard ? 'var(--wa)' : 'var(--ok)' }} />
                <div className="ql-inf">
                  <div className="ql-n">{fd(date)}</div>
                  <div className="ql-d">Entrada {time}{ex ? ' · Salida ' + ex.dt.split(' ')[1] : ' · en curso'}</div>
                </div>
                <Badge color={tard ? 'am' : 'gn'}>{tard ? 'tardanza ' + tard.qty : 'presente'}</Badge>
              </div>
            )
          })}
        </div>

        <div className="card">
          <div className="ch"><span className="cht">Novedades recientes</span><Link to="/emp/novedades" className="btn-gh btn-sm">Ver todas →</Link></div>
          {lastNovs.map((n) => (
            <div className="ql" key={n.id}>
              <div className="ql-inf">
                <div className="ql-n" data-tip={novTip(n.type)}>{n.type}</div>
                <div className="ql-d">{fd(n.d1)} · {n.qty}</div>
              </div>
              <StatusBadge st={n.st} />
            </div>
          ))}
          <div className="px-[18px] py-[10px]">
            <Link to="/emp/solicitudes" className="btn-pr btn-sm w-full">+ Nueva solicitud</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
