import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { TODAY } from '../../data/seed'
import { fd, fichTypeMeta } from '../../lib/format'
import { Avatar } from '../../components/ui/Avatar'
import { Badge, FichOrigenBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { IconPlus, IconSearch } from '../../components/ui/icons'

const EMPTY_FILT = { q: '', dt: '', tipo: '', org: '' }

export function Fichadas() {
  const { fichadas, novedades, emps, gEmp, addFichadaManual } = useData()
  const toast = useToast()
  const [filt, setFilt] = useState(EMPTY_FILT)
  const activeEmps = emps.filter((e) => e.role === 'empleado' && e.st === 'activo')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ eId: activeEmps[0]?.id ?? 0, tipo: 'entrada' as 'entrada' | 'salida', fecha: TODAY, hora: '', mot: '' })

  let list = [...fichadas].sort((a, b) => b.dt.localeCompare(a.dt))
  if (filt.q) list = list.filter((f) => { const e = gEmp(f.eId)!; return e.name.toLowerCase().includes(filt.q.toLowerCase()) || e.leg.includes(filt.q) })
  if (filt.dt) list = list.filter((f) => f.dt.startsWith(filt.dt))
  if (filt.tipo) list = list.filter((f) => f.type === filt.tipo)
  if (filt.org) list = list.filter((f) => f.org === filt.org)
  const shown = list.slice(0, 50)

  const save = () => {
    if (!form.eId || !form.fecha || !form.hora || !form.mot.trim()) {
      toast('Completá todos los campos.', 'er')
      return
    }
    const res = addFichadaManual(form.eId, form.tipo, form.fecha, form.hora)
    if (res.type === 'entrada' && res.tardanza) toast(`Fichada registrada. Novedad de Tardanza (${res.tardanza} min) generada automáticamente.`, 'wa')
    else if (res.type === 'entrada') toast('Fichada manual registrada correctamente.', 'ok')
    else toast('Fichada de salida registrada.', 'ok')
    setOpen(false)
    setForm({ ...form, hora: '', mot: '' })
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Fichadas</div>
          <div className="ph-s">{list.length} registro{list.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn-pr" onClick={() => setOpen(true)}><IconPlus size={13} />Fichada manual</button>
      </div>

      <div className="fb">
        <input className="fi" placeholder="Buscar empleado o legajo..." value={filt.q} onChange={(e) => setFilt({ ...filt, q: e.target.value })} />
        <input className="fs" type="date" value={filt.dt} onChange={(e) => setFilt({ ...filt, dt: e.target.value })} />
        <select className="fs" value={filt.tipo} onChange={(e) => setFilt({ ...filt, tipo: e.target.value })}>
          <option value="">Todo tipo</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <select className="fs" value={filt.org} onChange={(e) => setFilt({ ...filt, org: e.target.value })}>
          <option value="">Todo origen</option>
          <option value="biométrico">Biométrico</option>
          <option value="manual">Manual</option>
          <option value="qr">QR</option>
        </select>
        <button className="btn-ol btn-sm" onClick={() => setFilt(EMPTY_FILT)}>Limpiar</button>
      </div>

      <div className="card">
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Legajo</th>
                <th>Fecha y hora</th>
                <th>Tipo</th>
                <th>Origen <span className="cursor-help text-tm" data-tip="Biométrico: reloj físico. Manual: cargado por admin. QR: app móvil.">ⓘ</span></th>
                <th>Incidencia</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => {
                const e = gEmp(f.eId)!
                const [date, time] = f.dt.split(' ')
                const tard = f.type === 'entrada' ? novedades.find((n) => n.eId === f.eId && n.d1 === date && n.type === 'Tardanza') : undefined
                return (
                  <tr key={f.id}>
                    <td>
                      <div className="flex items-center gap-[9px]"><Avatar emp={e} /><span className="font-semibold">{e.name}</span></div>
                    </td>
                    <td><code className="rounded bg-bg px-[6px] py-[2px] text-[12px]">{e.leg}</code></td>
                    <td>{fd(date)} <strong>{time}</strong></td>
                    <td><Badge color={fichTypeMeta(f.type).color}>{fichTypeMeta(f.type).label}</Badge></td>
                    <td><FichOrigenBadge org={f.org} /></td>
                    <td>{tard ? <Badge color="am">tardanza {tard.qty}</Badge> : <span className="text-[12px] text-tm">—</span>}</td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <div className="empty-ico"><IconSearch size={22} /></div>
                      <div className="empty-t">Sin resultados</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar Fichada Manual"
        footer={
          <>
            <button className="btn-ol" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-pr" onClick={save}>Registrar fichada</button>
          </>
        }
      >
        <div className="mb-[14px] rounded-r border border-wa bg-wa-l px-[13px] py-[9px] text-[12px] font-medium" style={{ color: '#92400e' }}>
          ⚠️ El motor de reglas se ejecutará al guardar. Si la entrada supera la tolerancia del horario asignado, se generará una novedad de tardanza automáticamente.
        </div>
        <div className="fg">
          <label className="fl">Empleado</label>
          <select className="fsel" value={form.eId} onChange={(e) => setForm({ ...form, eId: +e.target.value })}>
            {activeEmps.map((e) => (<option key={e.id} value={e.id}>{e.name} (Leg. {e.leg})</option>))}
          </select>
        </div>
        <div className="fg">
          <label className="fl">Tipo de evento</label>
          <select className="fsel" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'entrada' | 'salida' })}>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="fl">Fecha</label>
            <input className="fin" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="fg">
            <label className="fl">Hora</label>
            <input className="fin" type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
          </div>
        </div>
        <div className="fg">
          <label className="fl">Motivo <span className="text-[10px] normal-case tracking-normal text-tm">(requerido)</span></label>
          <input className="fin" placeholder="ej: El empleado olvidó fichar en el reloj biométrico" value={form.mot} onChange={(e) => setForm({ ...form, mot: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
