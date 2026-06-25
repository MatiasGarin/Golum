import { useEffect, useState, type ReactNode } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { IconPlus } from '../../components/ui/icons'
import type { Shift, ShiftKind } from '../../types'
import { shiftKindLabel, shiftSummary } from '../../lib/format'

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const KIND_COLOR = { fijo: 'bl', rotativo: 'am', flexible: 'pu' } as const

function Timeline({ entry, exit, label }: { entry: string; exit: string; label?: ReactNode }) {
  const tm = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const eM = tm(entry)
  const sM = tm(exit)
  const tot = 24 * 60
  const lp = ((eM / tot) * 100).toFixed(1)
  const wp = (((sM - eM) / tot) * 100).toFixed(1)
  const dur = ((sM - eM) / 60).toFixed(1)
  return (
    <>
      <div className="relative h-[26px] overflow-hidden rounded-full bg-bd">
        <div
          className="absolute bottom-0 top-0 flex items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ left: `${lp}%`, width: `${wp}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)' }}
        >
          {dur}h
        </div>
      </div>
      <div className="mt-1 flex justify-between px-[2px] text-[10px] text-tm">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>
      {label && <div className="mt-[5px] text-center text-[11px] text-t2">{label}</div>}
    </>
  )
}

export function Horarios() {
  const { shifts, emps, addShift, saveShift } = useData()
  const toast = useToast()
  const [selId, setSelId] = useState(1)
  const [newKind, setNewKind] = useState<ShiftKind>('fijo')
  const sh = shifts.find((s) => s.id === selId) ?? shifts[0]

  const [form, setForm] = useState<Shift>(sh)
  useEffect(() => {
    if (sh) setForm(sh)
  }, [sh])

  if (!sh || !form) return null

  const upd = (patch: Partial<Shift>) => setForm((f) => ({ ...f, ...patch }) as Shift)

  const toggleDay = (d: number) =>
    upd({ days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d].sort() })

  const save = () => {
    saveShift(form)
    toast(`Horario "${form.name}" guardado.`, 'ok')
  }
  const add = () => {
    const nid = addShift(newKind)
    setSelId(nid)
    toast(`Nuevo horario ${shiftKindLabel(newKind).toLowerCase()} creado.`, 'in')
  }

  const assigned = emps.filter((e) => e.sid === sh.id && e.st === 'activo')

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Horarios</div>
          <div className="ph-s">Configuración de turnos fijos, rotativos y flexibles</div>
        </div>
        <div className="flex items-center gap-[8px]">
          <select className="fsel !mb-0 !w-auto" value={newKind} onChange={(e) => setNewKind(e.target.value as ShiftKind)}>
            <option value="fijo">Fijo</option>
            <option value="rotativo">Rotativo</option>
            <option value="flexible">Flexible</option>
          </select>
          <button className="btn-pr" onClick={add}><IconPlus size={13} />Nuevo horario</button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[14px] min-[900px]:grid-cols-[265px_1fr]">
        {/* Shift list */}
        <div className="card">
          <div className="ch"><span className="cht">Horarios configurados</span></div>
          {shifts.map((s) => {
            const cnt = emps.filter((e) => e.sid === s.id && e.st === 'activo').length
            const active = s.id === selId
            return (
              <div
                key={s.id}
                onClick={() => setSelId(s.id)}
                className={`cursor-pointer border-b border-bd border-l-[3px] px-[14px] py-[13px] transition-all last:border-b-0 ${
                  active ? 'border-l-pr bg-pr-l dark:bg-[rgba(37,99,235,.15)]' : 'border-l-transparent hover:bg-bg'
                }`}
              >
                <div className="mb-[3px] flex items-center justify-between gap-[6px]">
                  <span className="text-[13px] font-semibold text-t1">{s.name}</span>
                  <Badge color={KIND_COLOR[s.kind]}>{shiftKindLabel(s.kind)}</Badge>
                </div>
                <div className="mb-[5px] text-[12px] text-t2">{shiftSummary(s)}</div>
                <div className="flex flex-wrap gap-[5px]">
                  <Badge color="bl">{s.days.map((d) => ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d]).join('-')}</Badge>
                  <Badge color="gy">{cnt} empl.</Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Editor */}
        <div className="card">
          <div className="ch">
            <span className="cht">Editar: {sh.name} · {shiftKindLabel(sh.kind)}</span>
            <button className="btn-pr btn-sm" onClick={save}>Guardar</button>
          </div>
          <div className="p-[18px]">
            <div className="fgrid">
              <div className="fg">
                <label className="fl">Nombre del horario</label>
                <input className="fin" value={form.name} onChange={(e) => upd({ name: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Estado</label>
                <select className="fsel" value={form.st} onChange={(e) => upd({ st: e.target.value as Shift['st'] })}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Campos específicos por tipo */}
            {form.kind !== 'flexible' && (
              <>
                <div className="fgrid">
                  <div className="fg">
                    <label className="fl">Hora de entrada</label>
                    <input className="fin" type="time" value={form.entry} onChange={(e) => upd({ entry: e.target.value })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Hora de salida</label>
                    <input className="fin" type="time" value={form.exit} onChange={(e) => upd({ exit: e.target.value })} />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">Visualización del turno</label>
                  <div className="rounded-r bg-bg p-3">
                    <Timeline
                      entry={form.entry}
                      exit={form.exit}
                      label={<><strong>{form.entry}</strong> → <strong>{form.exit}</strong></>}
                    />
                  </div>
                </div>
              </>
            )}

            {form.kind === 'rotativo' && (
              <div className="mb-[14px] rounded-r bg-bg p-[14px]">
                <div className="fl mb-[10px]">
                  Período de vigencia{' '}
                  <span className="cursor-help text-tm" data-tip="El horario rotativo sólo se interpreta para fichadas dentro de este rango de fechas.">ⓘ</span>
                </div>
                <div className="fgrid">
                  <div className="fg !mb-0">
                    <label className="fl text-[10px]">Desde</label>
                    <input className="fin" type="date" value={form.periodStart} onChange={(e) => upd({ periodStart: e.target.value })} />
                  </div>
                  <div className="fg !mb-0">
                    <label className="fl text-[10px]">Hasta</label>
                    <input className="fin" type="date" value={form.periodEnd} onChange={(e) => upd({ periodEnd: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {form.kind === 'flexible' && (
              <>
                <div className="fgrid">
                  <div className="fg">
                    <label className="fl">Inicio de ventana</label>
                    <input className="fin" type="time" value={form.windowStart} onChange={(e) => upd({ windowStart: e.target.value })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Fin de ventana</label>
                    <input className="fin" type="time" value={form.windowEnd} onChange={(e) => upd({ windowEnd: e.target.value })} />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">
                    Horas a cumplir{' '}
                    <span className="cursor-help text-tm" data-tip="El empleado debe completar esta cantidad de horas dentro de la ventana. No se calcula tardanza.">ⓘ</span>
                  </label>
                  <input className="fin" type="number" min={1} max={24} step={0.5} value={form.hours} onChange={(e) => upd({ hours: +e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Visualización de la ventana</label>
                  <div className="rounded-r bg-bg p-3">
                    <Timeline
                      entry={form.windowStart}
                      exit={form.windowEnd}
                      label={<>Ventana <strong>{form.windowStart}</strong> → <strong>{form.windowEnd}</strong> · cumplir <strong>{form.hours}h</strong></>}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tolerancias (sólo fijo/rotativo) + descanso (todos) */}
            <div className="mb-[14px] rounded-r bg-bg p-[14px]">
              <div className="fl mb-[10px]">
                {form.kind === 'flexible' ? 'Descanso' : 'Tolerancias y umbrales'}{' '}
                <span className="cursor-help text-tm" data-tip="Estos parámetros controlan cuándo el motor de reglas genera novedades automáticas.">ⓘ</span>
              </div>
              <div className="fgrid">
                {form.kind !== 'flexible' && (
                  <>
                    <NumField label="Tol. entrada (min)" tip="Margen permitido sobre la hora de entrada. Dentro de este tiempo NO se genera tardanza." value={form.tolE} onChange={(v) => upd({ tolE: v })} max={60} />
                    <NumField label="Tol. salida (min)" tip="Margen antes de la hora de salida que no genera incidente." value={form.tolS} onChange={(v) => upd({ tolS: v })} max={60} />
                    <NumField label="Umbral HE (min)" tip="Minutos mínimos después de la salida para generar Horas Extra 50%." value={form.heT} onChange={(v) => upd({ heT: v })} max={120} />
                  </>
                )}
                <NumField label="Descanso mín (min)" tip="Pausa obligatoria. Si no registra salida/entrada de descanso se genera una alerta." value={form.bk} onChange={(v) => upd({ bk: v })} max={120} />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Días activos</label>
              <div className="flex flex-wrap gap-[5px]">
                {DAY_LABELS.map((d, i) => {
                  const on = form.days.includes(i + 1)
                  return (
                    <div
                      key={d}
                      onClick={() => toggleDay(i + 1)}
                      className={`flex h-[34px] w-[34px] cursor-pointer select-none items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all ${
                        on ? 'border-pr bg-pr text-white shadow-[0_2px_8px_rgba(37,99,235,.35)]' : 'border-bd bg-card text-tm'
                      }`}
                    >
                      {d}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="fg">
              <label className="fl">Empleados asignados</label>
              <div className="mt-1 flex flex-wrap gap-[7px]">
                {assigned.length === 0 && <span className="text-[12px] text-tm">Ningún empleado asignado a este horario.</span>}
                {assigned.map((e) => (
                  <div key={e.id} className="flex items-center gap-[5px] rounded-rf bg-bg py-[3px] pl-[3px] pr-[9px]">
                    <Avatar emp={e} />
                    <span className="text-[12px] font-medium">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NumField({ label, tip, value, onChange, max }: { label: string; tip: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="fg !mb-0">
      <label className="fl text-[10px]">
        {label} <span className="cursor-help text-tm" data-tip={tip}>ⓘ</span>
      </label>
      <input className="fin" type="number" min={0} max={max} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  )
}
