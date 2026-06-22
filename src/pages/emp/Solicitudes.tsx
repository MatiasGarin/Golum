import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { EMP_ID } from '../../data/seed'
import { fd } from '../../lib/format'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { IconFileText, IconCalendar } from '../../components/ui/icons'

type SolType = 'just' | 'lic' | null

const LIC_TIPOS = ['Médica', 'Examen', 'Maternidad / Paternidad', 'Fallecimiento familiar', 'Casamiento', 'Vacaciones anticipadas', 'Otro']

export function Solicitudes() {
  const { novedades, solicitudes, addSolicitudJustificativo, addSolicitudLicencia } = useData()
  const toast = useToast()
  const [solType, setSolType] = useState<SolType>(null)
  // form fields
  const [licTipo, setLicTipo] = useState('Médica')
  const [fi, setFi] = useState('')
  const [ff, setFf] = useState('')

  const justNovs = novedades.filter(
    (n) => n.eId === EMP_ID && (n.type === 'Tardanza' || n.type === 'Ausencia injustificada') && (n.st === 'pendiente' || n.st === 'rechazada'),
  )
  const myReqs = solicitudes.filter((s) => s.eId === EMP_ID).sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  const open = (t: 'just' | 'lic') => {
    setSolType(t)
    if (t === 'lic') { setLicTipo('Médica'); setFi(''); setFf('') }
  }

  const save = () => {
    if (solType === 'lic') {
      if (!fi || !ff) { toast('Completá las fechas de la licencia.', 'er'); return }
      if (fi > ff) { toast('La fecha de inicio debe ser anterior o igual a la fecha fin.', 'er'); return }
      addSolicitudLicencia(licTipo, fi, ff)
      toast('Solicitud de licencia enviada correctamente.', 'ok')
    } else {
      addSolicitudJustificativo()
      toast('Justificativo enviado correctamente.', 'ok')
    }
    setSolType(null)
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Solicitudes</div>
          <div className="ph-s">Enviá justificativos y solicitudes al área de RRHH</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <SolCard
          selected={solType === 'just'}
          onClick={() => open('just')}
          icon={<IconFileText size={24} />}
          name="Justificativo de tardanza o ausencia"
          desc="Adjuntá documentación para una novedad pendiente o rechazada"
        />
        <SolCard
          selected={solType === 'lic'}
          onClick={() => open('lic')}
          icon={<IconCalendar size={24} />}
          name="Solicitud de licencia"
          desc="Pedí licencia médica, por examen, maternidad/paternidad y más"
        />
      </div>

      <div className="card">
        <div className="ch"><span className="cht">Historial de solicitudes</span></div>
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Enviada</th>
                <th>Período</th>
                <th>Estado <span className="cursor-help text-tm" data-tip="Pendiente: en revisión. Aprobada: aceptada por RRHH. Rechazada: denegada.">ⓘ</span></th>
                <th>Respuesta del admin</th>
              </tr>
            </thead>
            <tbody>
              {myReqs.map((s) => (
                <tr key={s.id}>
                  <td>{s.type}</td>
                  <td className="text-[12px] text-t2">{fd(s.sentAt)}</td>
                  <td className="text-[12px] text-t2">{s.period}</td>
                  <td><StatusBadge st={s.st} /></td>
                  <td className="text-[12px] text-t2">{s.resp || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={solType != null}
        onClose={() => setSolType(null)}
        title={solType === 'lic' ? 'Solicitud de Licencia' : 'Justificativo de Tardanza o Ausencia'}
        footer={
          <>
            <button className="btn-ol" onClick={() => setSolType(null)}>Cancelar</button>
            <button className="btn-pr" onClick={save}>Enviar solicitud</button>
          </>
        }
      >
        {solType === 'lic' ? (
          <>
            <div className="fg">
              <label className="fl">Tipo de licencia</label>
              <select className="fsel" value={licTipo} onChange={(e) => setLicTipo(e.target.value)}>
                {LIC_TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="fgrid">
              <div className="fg"><label className="fl">Fecha inicio</label><input className="fin" type="date" value={fi} onChange={(e) => setFi(e.target.value)} /></div>
              <div className="fg"><label className="fl">Fecha fin</label><input className="fin" type="date" value={ff} onChange={(e) => setFf(e.target.value)} /></div>
            </div>
            <div className="fg"><label className="fl">Documentación adjunta (URL)</label><input className="fin" type="url" placeholder="https://drive.google.com/..." /></div>
            <div className="fg"><label className="fl">Comentario para el administrador</label><input className="fin" placeholder="Información adicional..." /></div>
          </>
        ) : (
          <>
            <div className="fg">
              <label className="fl">Novedad a justificar <span className="cursor-help text-tm" data-tip="Seleccioná la novedad pendiente o rechazada a la cual querés adjuntar documentación.">ⓘ</span></label>
              <select className="fsel">
                {justNovs.map((n) => (<option key={n.id} value={n.id}>{n.type} — {fd(n.d1)} ({n.st})</option>))}
                {justNovs.length === 0 && <option disabled>Sin novedades disponibles</option>}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Tipo de justificativo</label>
              <select className="fsel"><option>Certificado médico</option><option>Acta / documento oficial</option><option>Otro</option></select>
            </div>
            <div className="fg"><label className="fl">URL del archivo adjunto</label><input className="fin" type="url" placeholder="https://drive.google.com/..." /></div>
            <div className="fg"><label className="fl">Comentario (opcional)</label><input className="fin" placeholder="Explicación adicional..." /></div>
          </>
        )}
      </Modal>
    </div>
  )
}

function SolCard({ selected, onClick, icon, name, desc }: { selected: boolean; onClick: () => void; icon: React.ReactNode; name: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-rl border-2 bg-card p-[18px] text-center transition-all ${selected ? 'border-pr bg-pr-l dark:bg-[rgba(37,99,235,.15)]' : 'border-bd hover:border-pr hover:bg-pr-l dark:hover:bg-[rgba(37,99,235,.15)]'}`}
    >
      <div className="mx-auto mb-[10px] flex h-12 w-12 items-center justify-center rounded-rl bg-pr-l text-pr">{icon}</div>
      <div className="mb-[3px] text-[13px] font-bold text-t1">{name}</div>
      <div className="text-[11px] leading-snug text-t2">{desc}</div>
    </button>
  )
}
