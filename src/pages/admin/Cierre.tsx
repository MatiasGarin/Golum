import { Fragment, useState } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { useConfirm } from '../../store/ConfirmContext'
import { MAY_RES, JUN_RES } from '../../data/seed'
import { fd } from '../../lib/format'
import { downloadCSV } from '../../lib/csv'
import { Avatar } from '../../components/ui/Avatar'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { IconCheck, IconAlertTri, IconActivity, IconDownload, IconSend } from '../../components/ui/icons'
import type { ResRow } from '../../types'

const STEPS = ['Revisar fichadas', 'Validar novedades', 'Generar resumen', 'Exportar']

type PeriodState = 'pendiente' | 'borrador' | 'cerrado'

export function Cierre() {
  const { novedades, gEmp } = useData()
  const toast = useToast()
  const confirm = useConfirm()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  // Estado del período Junio 2026 (espeja CierreMensual.estado: borrador → cerrado).
  const [periodState, setPeriodState] = useState<PeriodState>('pendiente')

  const pend = novedades.filter((n) => n.st === 'pendiente' && n.d1.startsWith('2026-06')).length
  const generado = periodState !== 'pendiente'
  const cerrado = periodState === 'cerrado'

  // Pasos: Revisar (done) → Validar (según pendientes) → Generar resumen → Exportar.
  const stepState = (i: number): 'done' | 'act' | '' => {
    if (i === 0) return 'done'
    if (i === 1) return pend > 0 ? 'act' : 'done'
    if (i === 2) return generado ? 'done' : 'act'
    if (i === 3) return cerrado ? 'done' : generado ? 'act' : ''
    return ''
  }

  const toggleExp = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const generar = () => {
    setPeriodState('borrador')
    if (pend > 0) toast(`Resumen generado (borrador). Atención: ${pend} novedades pendientes sin resolver.`, 'wa')
    else toast('Resumen de Junio 2026 generado correctamente (borrador).', 'ok')
  }

  const dlCSV = () => {
    if (!generado) return
    const rows: (string | number)[][] = [['Empleado', 'Legajo', 'Días Trab.', 'Ausencias', 'Tard. (min)', 'HE 50% (min)', 'HE 100% (min)']]
    JUN_RES.forEach((r) => {
      const e = gEmp(r.eId)!
      rows.push([e.name, e.leg, r.dt, r.aus, r.tMin, r.he50, r.he100])
    })
    downloadCSV('preliquidacion_junio_2026.csv', rows)
    toast('Archivo CSV descargado correctamente.', 'ok')
  }

  const confClose = () =>
    confirm({
      title: 'Enviar y cerrar período',
      msg: pend > 0
        ? `Hay ${pend} novedades pendientes. ¿Igualmente enviar y cerrar el período? Esta acción es irreversible.`
        : '¿Enviar al contador y cerrar el período de Junio 2026? Esta acción es irreversible.',
      type: 'danger',
      cb: () => {
        setPeriodState('cerrado')
        toast('Período cerrado y enviado al contador correctamente.', 'ok')
      },
    })

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Cierre Mensual</div>
          <div className="ph-s">Generación del resumen de preliquidación para el contador</div>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative mb-6 flex items-start">
        <div className="absolute left-5 right-5 top-[19px] z-0 h-[2px] bg-bd" />
        {STEPS.map((s, i) => {
          const st = stepState(i)
          const circle = st === 'done' ? 'border-ok bg-ok text-white' : st === 'act' ? 'border-pr bg-pr text-white shadow-[0_4px_12px_rgba(37,99,235,.35)]' : 'border-bd bg-card text-tm'
          const lbl = st === 'done' ? 'text-ok' : st === 'act' ? 'text-pr' : 'text-tm'
          return (
            <div key={s} className="relative z-[1] flex flex-1 flex-col items-center">
              <div className={`mb-[7px] flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 text-[13px] font-bold transition-all ${circle}`}>
                {st === 'done' ? <IconCheck size={14} /> : i + 1}
              </div>
              <div className={`text-center text-[11px] font-semibold leading-tight ${lbl}`}>{s}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px] min-[900px]:grid-cols-[300px_1fr]">
        {/* LEFT */}
        <div>
          <div className="card mb-[14px]">
            <div className="ch"><span className="cht">Período a cerrar</span></div>
            <div className="p-[14px]">
              <div className="fg">
                <label className="fl">Mes / Año</label>
                <select className="fsel">
                  <option>{cerrado ? 'Junio 2026 ✅ Cerrado' : 'Junio 2026 (en curso)'}</option>
                  <option>Mayo 2026 ✅ Cerrado</option>
                </select>
              </div>
              <button className="btn-pr w-full disabled:cursor-not-allowed disabled:opacity-50" onClick={generar} disabled={cerrado}>
                <IconActivity size={13} />{generado ? 'Regenerar resumen' : 'Generar resumen'}
              </button>
              <div className="mt-[7px] text-[11px] text-tm">
                {cerrado
                  ? 'Período cerrado: el resumen es un snapshot inmutable.'
                  : generado
                    ? 'Borrador generado. Podés regenerarlo o exportarlo abajo.'
                    : 'Consolida la preliquidación del período. Habilita la exportación.'}
              </div>
            </div>
          </div>

          {/* Exportar: se abre debajo de "Generar resumen" una vez generado el borrador. */}
          {generado && (
            <div className="card mb-[14px]">
              <div className="ch"><span className="cht">Exportar al contador</span></div>
              <div className="p-[14px]">
                <div className="fg">
                  <label className="fl">Formato</label>
                  <select className="fsel"><option>CSV (.csv)</option><option>Excel (.xlsx)</option></select>
                </div>
                <div className="fg">
                  <label className="fl">Email del contador</label>
                  <input className="fin" type="email" defaultValue="contador@estudiocontable.com" />
                </div>
                <div className="flex gap-[7px]">
                  <button className="btn-ol flex-1" onClick={dlCSV} title="Descargar CSV sin cerrar el período">
                    <IconDownload size={13} />Descargar
                  </button>
                  <button className="btn-pr flex-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={confClose} disabled={cerrado} title={cerrado ? 'El período ya está cerrado' : 'Acción irreversible: cierra y envía al contador'}>
                    <IconSend size={13} />{cerrado ? 'Cerrado' : 'Cerrar y enviar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card mb-[14px]">
            <div className="ch"><span className="cht">Estado del período</span></div>
            <div className="p-[14px]">
              <EstadoRow label="Fichadas sin revisar" color="gn" value="0" />
              <EstadoRow label="Novedades pendientes" color={pend > 0 ? 'am' : 'gn'} value={pend} />
              <EstadoRow label="Empleados en el período" color="bl" value="5" />
              <div className="flex items-center justify-between py-[7px] text-[13px]">
                <span className="text-t2">Estado</span>
                <Badge color={cerrado ? 'gn' : generado ? 'bl' : 'am'}>
                  {cerrado ? 'Cerrado' : generado ? 'Borrador' : 'En curso'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-[14px] rounded-rl border border-bd bg-bg p-[14px]">
            <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.6px] text-t2">⚡ Alertas pre-cierre</div>
            <CheckItem ok label="Fichadas revisadas" detail="0 sin revisar" />
            <CheckItem ok={pend === 0} label="Novedades resueltas" detail={pend > 0 ? `${pend} pendientes` : 'Todo resuelto'} detailColor={pend > 0 ? 'var(--wa)' : 'var(--ok)'} />
            <CheckItem ok label="Empleados con actividad" detail="5 de 5" />
          </div>

        </div>

        {/* RIGHT */}
        <div>
          <div className="card mb-[14px] opacity-75">
            <div className="ch"><span className="cht">Mayo 2026 <Badge color="gn" className="ml-[6px]">✅ Cerrado — exportado 31/05/2026</Badge></span></div>
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th className="cursor-help" data-tip="Días con al menos una fichada de entrada.">Días trab.</th>
                    <th className="cursor-help" data-tip="Clasificadas: inj=injustificada, lic=licencia.">Ausencias</th>
                    <th className="cursor-help" data-tip="Minutos de tardanza del período (solo aprobadas).">Tard.</th>
                    <th className="cursor-help" data-tip="Minutos de horas extra al 50%.">HE 50%</th>
                    <th className="cursor-help" data-tip="Minutos de horas extra al 100%.">HE 100%</th>
                  </tr>
                </thead>
                <tbody>
                  {MAY_RES.map((r) => (
                    <ResTableRow key={r.eId} r={r} gEmp={gEmp} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="ch">
              <span className="cht">Junio 2026 <Badge color={cerrado ? 'gn' : generado ? 'bl' : 'am'} className="ml-[6px]">{cerrado ? '✅ Cerrado — enviado al contador' : generado ? 'Borrador generado' : 'En curso · hasta 18/06/2026'}</Badge></span>
              <span className="text-[11px] text-tm">Solo novedades no rechazadas</span>
            </div>
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th></th>
                    <th>Empleado</th>
                    <th className="cursor-help" data-tip="Días con fichada de entrada.">Días trab.</th>
                    <th>Ausencias</th>
                    <th className="cursor-help" data-tip="Minutos de tardanza.">Tard.</th>
                    <th className="cursor-help" data-tip="HE al 50%.">HE 50%</th>
                    <th className="cursor-help" data-tip="HE al 100%.">HE 100%</th>
                  </tr>
                </thead>
                <tbody>
                  {JUN_RES.map((r, i) => {
                    const e = gEmp(r.eId)!
                    const eNovs = novedades.filter((n) => n.eId === r.eId && n.st !== 'rechazada' && n.d1.startsWith('2026-06'))
                    const isOpen = expanded.has(i)
                    return (
                      <Fragment key={i}>
                        <tr>
                          <td className="w-[28px]">
                            <button
                              onClick={() => toggleExp(i)}
                              title="Ver novedades"
                              className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[12px] transition-all ${isOpen ? 'border-pr bg-pr text-white' : 'border-bd bg-card text-tm hover:bg-bg hover:text-t1'}`}
                            >
                              {isOpen ? '−' : '+'}
                            </button>
                          </td>
                          <td><div className="flex items-center gap-2"><Avatar emp={e} /><span className="font-semibold">{e.name}</span></div></td>
                          <td><strong>{r.dt}</strong></td>
                          <td>{r.aus}</td>
                          <td>{r.tMin > 0 ? <span className="font-semibold text-wa">{r.tMin} min</span> : <span className="text-tm">—</span>}</td>
                          <td>{r.he50 > 0 ? <span className="font-semibold text-in">{r.he50} min</span> : <span className="text-tm">—</span>}</td>
                          <td>{r.he100 > 0 ? <span className="font-semibold text-pu">{r.he100} min</span> : <span className="text-tm">—</span>}</td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-bg">
                            <td colSpan={7} className="py-[6px] pl-10 pr-[14px] text-[12px]">
                              <strong className="text-t2">Novedades del período:</strong>
                              <br />
                              {eNovs.length === 0 ? (
                                <span className="text-tm">Sin novedades registradas.</span>
                              ) : (
                                eNovs.map((n) => (
                                  <span key={n.id} className="mr-1 mt-[3px] inline-flex items-center gap-[5px]">
                                    <StatusBadge st={n.st} />
                                    <span>{n.type} · {fd(n.d1)}{n.d2 ? ' – ' + fd(n.d2) : ''} · <strong>{n.qty}</strong></span>
                                  </span>
                                ))
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EstadoRow({ label, color, value }: { label: string; color: 'gn' | 'am' | 'bl'; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-bd py-[7px] text-[13px]">
      <span className="text-t2">{label}</span>
      <Badge color={color}>{value}</Badge>
    </div>
  )
}

function CheckItem({ ok, label, detail, detailColor }: { ok: boolean; label: string; detail: string; detailColor?: string }) {
  return (
    <div className="flex items-center gap-[9px] border-b border-bd py-[7px] text-[13px] last:border-b-0">
      <div>{ok ? <IconCheck size={17} className="text-ok" /> : <IconAlertTri size={17} className="text-wa" />}</div>
      <div className="flex-1 text-t1">{label}</div>
      <div className="text-[11px] text-tm" style={detailColor ? { color: detailColor } : undefined}>{detail}</div>
    </div>
  )
}

function ResTableRow({ r, gEmp }: { r: ResRow; gEmp: (id: number) => import('../../types').Employee | undefined }) {
  const e = gEmp(r.eId)!
  return (
    <tr>
      <td><div className="flex items-center gap-2"><Avatar emp={e} /><span>{e.name}</span></div></td>
      <td><strong>{r.dt}</strong></td>
      <td>{r.aus}</td>
      <td>{r.tMin > 0 ? <span className="font-semibold text-wa">{r.tMin} min</span> : <span className="text-tm">—</span>}</td>
      <td>{r.he50 > 0 ? <span className="font-semibold text-in">{r.he50} min</span> : <span className="text-tm">—</span>}</td>
      <td>{r.he100 > 0 ? <span className="font-semibold text-pu">{r.he100} min</span> : <span className="text-tm">—</span>}</td>
    </tr>
  )
}
