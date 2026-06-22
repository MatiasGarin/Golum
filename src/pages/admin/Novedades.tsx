import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { TODAY } from '../../data/seed'
import { fd, novTip, novTipoMeta, NOVEDAD_TYPES } from '../../lib/format'
import { Avatar } from '../../components/ui/Avatar'
import { OrigenBadge, StatusBadge, RoleBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useNovActions } from '../../hooks/useNovActions'
import { IconPlus, IconCheck, IconX, IconBell } from '../../components/ui/icons'
import type { Novedad } from '../../types'

const EMPTY_FILT = { q: '', tipo: '', st: '', org: '' }

export function Novedades() {
  const { novedades, emps, gEmp, addNovedadManual } = useData()
  const toast = useToast()
  const { approve, reject } = useNovActions()
  const activeEmps = emps.filter((e) => e.role === 'empleado' && e.st === 'activo')

  const [filt, setFilt] = useState(EMPTY_FILT)
  const [open, setOpen] = useState(false)
  const [detId, setDetId] = useState<number | null>(null)
  const [form, setForm] = useState({ eId: activeEmps[0]?.id ?? 0, tipo: 'Tardanza', fi: TODAY, ff: '', qty: '', just: '', obs: '' })

  let list = [...novedades].sort((a, b) => b.d1.localeCompare(a.d1))
  if (filt.q) list = list.filter((n) => gEmp(n.eId)!.name.toLowerCase().includes(filt.q.toLowerCase()))
  if (filt.tipo) list = list.filter((n) => n.type === filt.tipo)
  if (filt.st) list = list.filter((n) => n.st === filt.st)
  if (filt.org) list = list.filter((n) => n.org === filt.org)
  const pend = novedades.filter((n) => n.st === 'pendiente').length

  const meta = novTipoMeta(form.tipo)

  const save = () => {
    if (!form.eId || !form.fi) {
      toast('Completá empleado y fecha inicio.', 'er')
      return
    }
    addNovedadManual({ eId: form.eId, type: form.tipo, d1: form.fi, d2: form.ff || null, qty: form.qty ? `${form.qty} min` : '1 día', obs: form.obs || null, just: form.just || null })
    toast('Novedad cargada correctamente.', 'ok')
    setOpen(false)
    setForm({ ...form, qty: '', just: '', obs: '', ff: '' })
  }

  const detNov = detId != null ? novedades.find((n) => n.id === detId) : null

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Novedades</div>
          <div className="ph-s">{pend} pendiente{pend !== 1 ? 's' : ''} de resolución</div>
        </div>
        <button className="btn-pr" onClick={() => setOpen(true)}><IconPlus size={13} />Cargar novedad</button>
      </div>

      <div className="fb">
        <input className="fi" placeholder="Buscar empleado..." value={filt.q} onChange={(e) => setFilt({ ...filt, q: e.target.value })} />
        <select className="fs" value={filt.tipo} onChange={(e) => setFilt({ ...filt, tipo: e.target.value })}>
          <option value="">Todo tipo</option>
          {NOVEDAD_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select className="fs" value={filt.st} onChange={(e) => setFilt({ ...filt, st: e.target.value })}>
          <option value="">Todo estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <select className="fs" value={filt.org} onChange={(e) => setFilt({ ...filt, org: e.target.value })}>
          <option value="">Todo origen</option>
          <option value="automática">Automáticas</option>
          <option value="manual">Manuales</option>
        </select>
        <button className="btn-ol btn-sm" onClick={() => setFilt(EMPTY_FILT)}>Limpiar</button>
      </div>

      <div className="card">
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo <span className="cursor-help text-tm" data-tip="Determina cómo se computa la novedad en la preliquidación mensual.">ⓘ</span></th>
                <th>Fecha(s)</th>
                <th>Cantidad</th>
                <th>Origen</th>
                <th>Estado <span className="cursor-help text-tm" data-tip="Pendiente: sin resolver. Aprobada: incluida en preliquidación. Rechazada: excluida.">ⓘ</span></th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => {
                const e = gEmp(n.eId)!
                const dates = n.d2 ? `${fd(n.d1)} – ${fd(n.d2)}` : fd(n.d1)
                return (
                  <tr key={n.id}>
                    <td><div className="flex items-center gap-[9px]"><Avatar emp={e} /><span className="font-semibold">{e.name}</span></div></td>
                    <td><span data-tip={novTip(n.type)}>{n.type}</span></td>
                    <td className="text-[12px] text-t2">{dates}</td>
                    <td><strong>{n.qty}</strong></td>
                    <td><OrigenBadge org={n.org} /></td>
                    <td><StatusBadge st={n.st} /></td>
                    <td>
                      {n.st === 'pendiente' ? (
                        <div className="flex gap-1">
                          <button className="btn-ok btn-sm" onClick={() => approve(n.id)}><IconCheck size={11} />Aprobar</button>
                          <button className="btn-er btn-sm" onClick={() => reject(n.id)}><IconX size={11} />Rechazar</button>
                        </div>
                      ) : (
                        <button className="btn-gh btn-sm" onClick={() => setDetId(n.id)}>Ver detalle</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty"><div className="empty-ico"><IconBell size={22} /></div><div className="empty-t">Sin resultados</div></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cargar novedad */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cargar Novedad Manual"
        size="lg"
        footer={
          <>
            <button className="btn-ol" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-pr" onClick={save}>Guardar novedad</button>
          </>
        }
      >
        <div className="fg">
          <label className="fl">Empleado</label>
          <select className="fsel" value={form.eId} onChange={(e) => setForm({ ...form, eId: +e.target.value })}>
            {activeEmps.map((e) => (<option key={e.id} value={e.id}>{e.name} (Leg. {e.leg})</option>))}
          </select>
        </div>
        <div className="fg">
          <label className="fl">Tipo de novedad <span className="cursor-help text-tm" data-tip="El tipo determina cómo se computa en la preliquidación final del mes.">ⓘ</span></label>
          <select className="fsel" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {NOVEDAD_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <p className="fhint">{meta.hint}</p>
        </div>
        <div className="fgrid">
          <div className="fg"><label className="fl">Fecha inicio</label><input className="fin" type="date" value={form.fi} onChange={(e) => setForm({ ...form, fi: e.target.value })} /></div>
          <div className="fg"><label className="fl">Fecha fin <span className="text-[10px] normal-case tracking-normal text-tm">(opcional)</span></label><input className="fin" type="date" value={form.ff} onChange={(e) => setForm({ ...form, ff: e.target.value })} /></div>
        </div>
        <div className="fgrid">
          <div className="fg"><label className="fl">{meta.qtyLabel}</label><input className="fin" type="number" min={1} placeholder="ej: 25" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
          <div className="fg"><label className="fl">Justificativo (URL)</label><input className="fin" type="url" placeholder="https://drive.google.com/..." value={form.just} onChange={(e) => setForm({ ...form, just: e.target.value })} /></div>
        </div>
        <div className="fg"><label className="fl">Observación para el contador</label><input className="fin" placeholder="Notas adicionales..." value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} /></div>
      </Modal>

      {/* Detalle */}
      <Modal open={detId != null} onClose={() => setDetId(null)} title="Detalle de Novedad" footer={<button className="btn-ol" onClick={() => setDetId(null)}>Cerrar</button>}>
        {detNov && <NovDetalle n={detNov} emp={gEmp(detNov.eId)!} />}
      </Modal>
    </div>
  )
}

function NovDetalle({ n, emp }: { n: Novedad; emp: import('../../types').Employee }) {
  const fields: [string, React.ReactNode][] = [
    ['Tipo', <span data-tip={novTip(n.type)}>{n.type}</span>],
    ['Origen', <OrigenBadge org={n.org} />],
    ['Estado', <StatusBadge st={n.st} />],
    ['Cantidad', <strong>{n.qty}</strong>],
    ['Fecha inicio', fd(n.d1)],
    ['Fecha fin', fd(n.d2)],
    ['Observación', n.obs || '—'],
    ['Justificativo', n.just ? <a href={n.just} target="_blank" rel="noreferrer" className="text-pr">Ver documento →</a> : '—'],
    ['Resuelto por', n.resBy || '—'],
    ['Resuelto el', fd(n.resAt)],
  ]
  return (
    <>
      <div className="mb-[18px] flex items-center gap-3 border-b border-bd pb-[16px]">
        <Avatar emp={emp} size="lg" />
        <div>
          <div className="text-[15px] font-bold">{emp.name}</div>
          <div className="flex items-center gap-2 text-[12px] text-t2">Leg. {emp.leg} · <RoleBadge role={emp.role} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([k, v], i) => (
          <div key={i} className="rounded-r bg-bg px-3 py-[10px]">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.5px] text-tm">{k}</div>
            <div className="text-[13px]">{v}</div>
          </div>
        ))}
      </div>
    </>
  )
}
