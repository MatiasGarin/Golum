import { useData } from '../../store/DataContext'
import { TODAY } from '../../data/seed'
import { fd, novTip } from '../../lib/format'
import { MetricCard } from '../../components/ui/MetricCard'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { AttendanceBar } from '../../components/charts/AttendanceBar'
import { NovedadesDonut } from '../../components/charts/NovedadesDonut'
import { useNovActions } from '../../hooks/useNovActions'
import { Link } from 'react-router-dom'
import { IconUsers, IconXCircle, IconAlertCircle, IconBell, IconCheck, IconX } from '../../components/ui/icons'

export function Dashboard() {
  const { emps, fichadas, novedades, gEmp } = useData()
  const { approve, reject } = useNovActions()

  const activeE = emps.filter((e) => e.role === 'empleado' && e.st === 'activo')
  const presentIds = [...new Set(fichadas.filter((f) => f.type === 'entrada' && f.dt.startsWith(TODAY)).map((f) => f.eId))]
  const present = presentIds.length
  const absent = activeE.length - present
  const tard = novedades.filter((n) => n.d1 === TODAY && n.type === 'Tardanza').length
  const pend = novedades.filter((n) => n.st === 'pendiente').length
  const recent = [...fichadas].filter((f) => f.type === 'entrada').sort((a, b) => b.dt.localeCompare(a.dt)).slice(0, 5)
  const pendNovs = novedades.filter((n) => n.st === 'pendiente').slice(0, 5)
  const novT: Record<string, number> = {}
  novedades.forEach((n) => {
    novT[n.type] = (novT[n.type] || 0) + 1
  })

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Buen día, María 👋</div>
          <div className="ph-s">Miércoles, 18 de junio de 2026 · Resumen del día en tiempo real</div>
        </div>
      </div>

      <div className="mb-5 grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
        <MetricCard color="gn" icon={<IconUsers size={19} />} label="Presentes hoy" value={present} sub={`de ${activeE.length} activos`} tip="Empleados activos con fichada de entrada hoy." />
        <MetricCard color="rd" icon={<IconXCircle size={19} />} label="Ausentes hoy" value={absent} sub="sin fichada de entrada" tip="Empleados activos sin fichada de entrada hoy." />
        <MetricCard color="am" icon={<IconAlertCircle size={19} />} label="Con tardanza" value={tard} sub="fichadas fuera de tolerancia" tip="Empleados cuya entrada superó la tolerancia del horario asignado." />
        <MetricCard
          color="pu"
          icon={<IconBell size={19} />}
          label="Nov. pendientes"
          value={pend}
          sub={<Link to="/admin/novedades" className="text-pr">Revisar →</Link>}
          tip="Novedades sin resolver. Deben ser aprobadas o rechazadas antes del cierre mensual."
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-[14px] min-[900px]:grid-cols-[2fr_1fr]">
        <div className="rounded-rl border border-bd bg-card p-[18px] shadow-sh0">
          <div className="mb-[14px]">
            <div className="text-[13px] font-semibold text-t1">Asistencia de la semana</div>
            <div className="mt-[2px] text-[11px] text-tm">Empleados presentes por día laborable</div>
          </div>
          <div className="h-[195px]">
            <AttendanceBar />
          </div>
        </div>
        <div className="rounded-rl border border-bd bg-card p-[18px] shadow-sh0">
          <div className="mb-[14px]">
            <div className="text-[13px] font-semibold text-t1">Novedades del mes</div>
            <div className="mt-[2px] text-[11px] text-tm">Distribución por tipo</div>
          </div>
          <div className="h-[180px]">
            <NovedadesDonut data={novT} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        <div className="card">
          <div className="ch">
            <span className="cht">Últimas fichadas</span>
            <Link to="/admin/fichadas" className="btn-gh btn-sm">Ver todas →</Link>
          </div>
          {recent.map((f) => {
            const e = gEmp(f.eId)!
            const [date, time] = f.dt.split(' ')
            const isTard = novedades.find((n) => n.eId === f.eId && n.d1 === date && n.type === 'Tardanza')
            return (
              <div className="ql" key={f.id}>
                <Avatar emp={e} />
                <div className="ql-inf">
                  <div className="ql-n">{e.name}</div>
                  <div className="ql-d">Leg. {e.leg} · {fd(date)}</div>
                </div>
                <div className="flex flex-col items-end gap-[3px]">
                  <span className="text-[12px] font-semibold text-t2">{time}</span>
                  {isTard ? <Badge color="am" className="text-[10px]">tardanza</Badge> : <Badge color="gn" className="text-[10px]">puntual</Badge>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="card">
          <div className="ch">
            <span className="cht">Novedades pendientes</span>
            <Link to="/admin/novedades" className="btn-gh btn-sm">Ver todas →</Link>
          </div>
          {pendNovs.length === 0 ? (
            <div className="empty">
              <div className="empty-ico"><IconCheck size={22} /></div>
              <p>Sin novedades pendientes</p>
            </div>
          ) : (
            pendNovs.map((n) => {
              const e = gEmp(n.eId)!
              return (
                <div className="ql" key={n.id}>
                  <Avatar emp={e} />
                  <div className="ql-inf">
                    <div className="ql-n">{e.name}</div>
                    <div className="ql-d" data-tip={novTip(n.type)}>{n.type} · {fd(n.d1)}</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-ok btn-sm" onClick={() => approve(n.id)}><IconCheck size={12} /></button>
                    <button className="btn-er btn-sm" onClick={() => reject(n.id)}><IconX size={12} /></button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
