import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { EMP_ID } from '../../data/seed'
import { fd, novTip } from '../../lib/format'
import { OrigenBadge, StatusBadge } from '../../components/ui/Badge'
import { IconBell } from '../../components/ui/icons'

const TIPOS = ['Tardanza', 'Ausencia injustificada', 'Horas extra 50%', 'Licencia médica']

export function EmpNovedades() {
  const { novedades } = useData()
  const [tipo, setTipo] = useState('')
  const [st, setSt] = useState('')

  let list = novedades.filter((n) => n.eId === EMP_ID).sort((a, b) => b.d1.localeCompare(a.d1))
  if (tipo) list = list.filter((n) => n.type === tipo)
  if (st) list = list.filter((n) => n.st === st)
  const pend = novedades.filter((n) => n.eId === EMP_ID && n.st === 'pendiente').length

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Mis Novedades</div>
          <div className="ph-s">Historial completo de novedades — {pend} pendiente{pend !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="fb">
        <select className="fs" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select className="fs" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button className="btn-ol btn-sm" onClick={() => { setTipo(''); setSt('') }}>Limpiar</button>
      </div>

      <div className="card">
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tipo <span className="cursor-help text-tm" data-tip="El tipo indica qué evento fue registrado y cómo impacta en tu liquidación.">ⓘ</span></th>
                <th>Fecha(s)</th>
                <th>Cantidad</th>
                <th>Origen <span className="cursor-help text-tm" data-tip="Automática: generada por el sistema al fichar. Manual: cargada por el admin o por tu solicitud.">ⓘ</span></th>
                <th>Estado <span className="cursor-help text-tm" data-tip="Pendiente: el admin aún no la revisó. Aprobada: incluida en tu liquidación. Rechazada: no impacta.">ⓘ</span></th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => {
                const dates = n.d2 ? `${fd(n.d1)} – ${fd(n.d2)}` : fd(n.d1)
                return (
                  <tr key={n.id}>
                    <td><span data-tip={novTip(n.type)}>{n.type}</span></td>
                    <td className="text-[12px] text-t2">{dates}</td>
                    <td><strong>{n.qty}</strong></td>
                    <td><OrigenBadge org={n.org} /></td>
                    <td><StatusBadge st={n.st} /></td>
                    <td className="text-[12px] text-t2">{n.obs || '—'}</td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty"><div className="empty-ico"><IconBell size={22} /></div><div className="empty-t">Sin resultados</div></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
