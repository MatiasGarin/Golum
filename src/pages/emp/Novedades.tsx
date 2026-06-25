import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { EMP_ID } from '../../data/seed'
import { fd, novTip } from '../../lib/format'
import { pendienteDeResolucion, requiereAutorizacion, esJustificable } from '../../lib/novedad'
import { OrigenBadge, NovStatusBadge } from '../../components/ui/Badge'
import { IconBell } from '../../components/ui/icons'
import type { Novedad } from '../../types'

const TIPOS = ['Tardanza', 'Salida anticipada', 'Ausencia', 'Horas extra 50%', 'Licencia médica']

// Bucket de situación para el filtro del empleado.
const sit = (n: Novedad): 'pend' | 'ok' | 'no' | 'sin' => {
  if (pendienteDeResolucion(n)) return 'pend'
  if (n.justSt === 'aprobada' || (requiereAutorizacion(n.type) && n.st === 'aprobada')) return 'ok'
  if (n.justSt === 'rechazada' || (requiereAutorizacion(n.type) && n.st === 'rechazada')) return 'no'
  if (esJustificable(n.type) && !n.justSt) return 'sin'
  return 'ok'
}

export function EmpNovedades() {
  const { novedades } = useData()
  const [tipo, setTipo] = useState('')
  const [st, setSt] = useState('')

  let list = novedades.filter((n) => n.eId === EMP_ID).sort((a, b) => b.d1.localeCompare(a.d1))
  if (tipo) list = list.filter((n) => n.type === tipo)
  if (st) list = list.filter((n) => sit(n) === st)
  const pend = novedades.filter((n) => n.eId === EMP_ID && pendienteDeResolucion(n)).length

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
          <option value="">Toda situación</option>
          <option value="sin">Sin justificar</option>
          <option value="pend">Pendiente de resolución</option>
          <option value="ok">Justificada / autorizada</option>
          <option value="no">Rechazada</option>
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
                <th>Estado <span className="cursor-help text-tm" data-tip="Los desvíos quedan registrados en firme. 'Justificada' = el admin aprobó tu justificativo y se excluye del reporte. Las horas extra se autorizan aparte.">ⓘ</span></th>
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
                    <td><NovStatusBadge n={n} /></td>
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
