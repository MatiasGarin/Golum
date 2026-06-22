import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { EMP_ID } from '../../data/seed'
import { fd, mName, p2 } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { IconChevronLeft, IconChevronRight, IconAlertCircle, IconXCircle } from '../../components/ui/icons'

const HM_LEGEND: [string, string][] = [
  ['hm-c-pr', 'Presente'],
  ['hm-c-ta', 'Tardanza'],
  ['hm-c-au', 'Ausente'],
  ['hm-c-nl', 'No laborable'],
]

export function Asistencia() {
  const { fichadas, novedades } = useData()
  const [calM, setCalM] = useState(6)
  const [calY, setCalY] = useState(2026)
  const [selDay, setSelDay] = useState(18)

  const empF = fichadas.filter((f) => f.eId === EMP_ID)
  const empN = novedades.filter((n) => n.eId === EMP_ID)
  const today = 18

  const y = calY
  const m = calM
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const getDayStatus = (day: number): string => {
    if (day > today) return 'future'
    const ds = `${y}-${p2(m)}-${p2(day)}`
    const dow = new Date(y, m - 1, day).getDay()
    if (dow === 0 || dow === 6) return 'weekend'
    const entry = empF.find((f) => f.type === 'entrada' && f.dt.startsWith(ds))
    if (!entry) return 'absent'
    const tard = empN.find((n) => n.d1 === ds && n.type === 'Tardanza')
    return tard ? 'tardanza' : 'presente'
  }

  // Monthly history rows (today..1, weekdays only)
  const workDays = []
  for (let d = today; d >= 1; d--) {
    const ds = `${y}-${p2(m)}-${p2(d)}`
    const dow = new Date(y, m - 1, d).getDay()
    if (dow === 0 || dow === 6) continue
    workDays.push({
      ds,
      entry: empF.find((f) => f.type === 'entrada' && f.dt.startsWith(ds)),
      exit: empF.find((f) => f.type === 'salida' && f.dt.startsWith(ds)),
      tard: empN.find((n) => n.d1 === ds && n.type === 'Tardanza'),
      he: empN.find((n) => n.d1 === ds && n.type === 'Horas extra 50%'),
    })
  }

  // Heatmap — last 15 weeks ending 2026-06-18
  const hmWeeks: { cls: string; tip: string }[][] = []
  const refDate = new Date(2026, 5, 18)
  for (let w = 14; w >= 0; w--) {
    const wDays: { cls: string; tip: string }[] = []
    for (let d = 0; d < 7; d++) {
      const dt = new Date(refDate)
      dt.setDate(refDate.getDate() - w * 7 + (d - 6))
      const ds = `${dt.getFullYear()}-${p2(dt.getMonth() + 1)}-${p2(dt.getDate())}`
      const dow = dt.getDay()
      if (dt > refDate) { wDays.push({ cls: 'hm-c-fu', tip: 'Día futuro' }); continue }
      if (dow === 0 || dow === 6) { wDays.push({ cls: 'hm-c-nl', tip: 'No laborable' }); continue }
      const entry = empF.find((f) => f.type === 'entrada' && f.dt.startsWith(ds))
      if (!entry) {
        const isFut = new Date(ds) > new Date('2026-06-01')
        wDays.push(isFut ? { cls: 'hm-c-au', tip: 'Ausente - ' + ds } : { cls: 'hm-c-nl', tip: 'Anterior al período' })
      } else {
        const tard = empN.find((n) => n.d1 === ds && n.type === 'Tardanza')
        wDays.push({ cls: tard ? 'hm-c-ta' : 'hm-c-pr', tip: (tard ? 'Tardanza - ' : 'Presente - ') + ds })
      }
    }
    hmWeeks.push(wDays)
  }

  const prevMonth = () => {
    if (calM > 1) setCalM(calM - 1)
    else { setCalM(12); setCalY(calY - 1) }
  }
  const nextMonth = () => {
    if (calM < 6 || (calM === 6 && calY < 2026)) {
      if (calM < 12) setCalM(calM + 1)
      else { setCalM(1); setCalY(calY + 1) }
    }
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Mi Asistencia</div>
          <div className="ph-s">Historial de asistencia de Juan Pérez</div>
        </div>
      </div>

      <div className="ms-bar">
        <div className="ms-btn" onClick={prevMonth}><IconChevronLeft size={14} /></div>
        <div className="ms-lbl flex-1 text-center">{mName(m, y)}</div>
        <div className="ms-btn" onClick={nextMonth}><IconChevronRight size={14} /></div>
        <div className="ml-3 flex flex-wrap gap-[10px]">
          {HM_LEGEND.map(([c, l]) => (
            <div key={c} className="flex items-center gap-[5px] text-[11px] text-t2">
              <div className={`hm-cell ${c} !h-3 !w-3 shrink-0 rounded-[3px]`} />
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-[14px]">
        <div className="ch"><span className="cht">Actividad — últimas 15 semanas</span></div>
        <div className="overflow-x-auto p-4">
          <div className="flex min-w-max gap-[3px]">
            {hmWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((d, di) => (
                  <div key={di} className={`hm-cell ${d.cls} !h-[14px] !w-[14px]`} title={d.tip} />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-[6px] flex justify-between px-[2px] text-[10px] text-tm"><span>Hace 15 semanas</span><span>Hoy</span></div>
        </div>
      </div>

      <div className="mb-[14px] grid grid-cols-1 items-start gap-[14px] min-[900px]:grid-cols-[auto_1fr]">
        <div className="card min-w-[280px]">
          <div className="ch"><span className="cht">{mName(m, y)}</span></div>
          <div className="p-3">
            <div className="cal-grid">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (<div key={d} className="cal-dh">{d}</div>))}
              {Array(offset).fill(0).map((_, i) => (<div key={`o${i}`} />))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1
                const status = getDayStatus(d)
                const ds = `${y}-${p2(m)}-${p2(d)}`
                const dotCls = status === 'presente' ? 'd-pr' : status === 'tardanza' ? 'd-ta' : status === 'absent' ? 'd-au' : ''
                const cellCls = `${d === today ? 'today ' : ''}${d === selDay ? 'sel ' : ''}${status === 'weekend' || status === 'future' ? 'nl' : ''}`
                return (
                  <div key={d} className={`cal-d ${cellCls}`} onClick={() => setSelDay(d)} title={ds}>
                    {d}
                    {dotCls && <div className={`d-dot ${dotCls}`} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="ch"><span className="cht">Detalle — {selDay ? `${selDay} de ${mName(m, y).split(' ')[0]} ${y}` : ''}</span></div>
          <div className="p-4">
            <DayDetail y={y} m={m} selDay={selDay} today={today} empF={empF} empN={empN} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ch"><span className="cht">Historial del mes</span></div>
        <div className="tw">
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Nota</th></tr></thead>
            <tbody>
              {workDays.map(({ ds, entry, exit, tard, he }) => {
                const eT = entry ? entry.dt.split(' ')[1] : '—'
                const sT = exit ? exit.dt.split(' ')[1] : '—'
                let horas = '—'
                if (entry && exit) {
                  const [eh, em] = eT.split(':').map(Number)
                  const [sh2, sm] = sT.split(':').map(Number)
                  horas = `${Math.floor((sh2 * 60 + sm - (eh * 60 + em)) / 60)}h ${(sh2 * 60 + sm - (eh * 60 + em)) % 60}m`
                }
                return (
                  <tr key={ds}>
                    <td><strong>{fd(ds)}</strong></td>
                    <td>{eT}</td>
                    <td>{sT}</td>
                    <td>{horas}</td>
                    <td>{!entry ? <Badge color="rd">Ausente</Badge> : tard ? <Badge color="am">Tardanza {tard.qty}</Badge> : <Badge color="gn">Presente</Badge>}</td>
                    <td>{!exit && entry ? <span className="text-[11px] text-tm">Jornada en curso</span> : he ? <span className="text-[11px] text-in">{he.qty} HE 50%</span> : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DayDetail({
  y, m, selDay, today, empF, empN,
}: {
  y: number; m: number; selDay: number; today: number
  empF: import('../../types').Fichada[]; empN: import('../../types').Novedad[]
}) {
  const ds = `${y}-${p2(m)}-${p2(selDay)}`
  const dow = new Date(y, m - 1, selDay).getDay()
  if (dow === 0 || dow === 6)
    return (
      <div className="empty"><div className="empty-ico"><IconAlertCircle size={22} /></div><p>Día no laborable</p></div>
    )
  if (selDay > today) return <div className="empty"><p>Día futuro — sin datos disponibles</p></div>
  const entry = empF.find((f) => f.type === 'entrada' && f.dt.startsWith(ds))
  const exit = empF.find((f) => f.type === 'salida' && f.dt.startsWith(ds))
  const tard = empN.find((n) => n.d1 === ds && n.type === 'Tardanza')
  const he = empN.find((n) => n.d1 === ds && n.type === 'Horas extra 50%')
  if (!entry)
    return (
      <div className="empty"><div className="empty-ico"><IconXCircle size={22} /></div><div className="empty-t">Ausente</div><p>Sin fichada registrada este día.</p></div>
    )
  const [eh, em] = entry.dt.split(' ')[1].split(':').map(Number)
  const [sh2, sm] = exit ? exit.dt.split(' ')[1].split(':').map(Number) : [null, null]
  const horas = exit && sh2 != null && sm != null ? `${Math.floor((sh2 * 60 + sm - (eh * 60 + em)) / 60)}h ${(sh2 * 60 + sm - (eh * 60 + em)) % 60}min` : 'en curso'
  const fields: [string, React.ReactNode][] = [
    ['Entrada', entry.dt.split(' ')[1]],
    ['Salida', exit ? exit.dt.split(' ')[1] : 'en curso'],
    ['Horas trabajadas', horas],
    ['Tardanza', tard ? tard.qty : '—'],
    ['HE 50%', he ? he.qty : '—'],
    ['Estado', tard ? <Badge color="am">Tardanza</Badge> : <Badge color="gn">Presente</Badge>],
  ]
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {fields.map(([k, v], i) => (
        <div key={i} className="rounded-r bg-bg px-3 py-[10px]">
          <div className="mb-[3px] text-[10px] font-semibold uppercase tracking-[.5px] text-tm">{k}</div>
          <div className="text-[13px] font-semibold">{v}</div>
        </div>
      ))}
    </div>
  )
}
