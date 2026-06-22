import { useState } from 'react'
import { useData } from '../../store/DataContext'
import { useToast } from '../../store/ToastContext'
import { useConfirm } from '../../store/ConfirmContext'
import { Avatar } from '../../components/ui/Avatar'
import { RoleBadge, StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { IconPlus, IconEdit, IconXCircle, IconCheck } from '../../components/ui/icons'
import type { Employee, Role } from '../../types'

export function Usuarios() {
  const { emps, shifts, gShift, toggleUser } = useData()
  const toast = useToast()
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', leg: '', rol: 'empleado' as Role, sid: 1 })
  const [editId, setEditId] = useState<number | null>(null)

  const filtered = emps.filter((e) => {
    if (!q) return true
    const s = q.toLowerCase()
    return e.name.toLowerCase().includes(s) || e.leg.includes(q) || e.email.toLowerCase().includes(s)
  })

  const openNew = () => {
    setEditId(null)
    setForm({ nom: '', email: '', leg: '', rol: 'empleado', sid: 1 })
    setModalOpen(true)
  }
  const openEdit = (e: Employee) => {
    setEditId(e.id)
    setForm({ nom: e.name, email: e.email, leg: e.leg, rol: e.role, sid: e.sid ?? 1 })
    setModalOpen(true)
  }
  const save = () => {
    if (!form.nom.trim() || !form.email.trim()) {
      toast('Completá nombre y email.', 'er')
      return
    }
    setModalOpen(false)
    toast('Usuario guardado correctamente.', 'ok')
  }
  const toggle = (e: Employee) =>
    confirm({
      title: e.st === 'activo' ? 'Dar de baja usuario' : 'Reactivar usuario',
      msg: e.st === 'activo' ? `¿Dar de baja a ${e.name}? No podrá acceder al sistema.` : `¿Reactivar a ${e.name}?`,
      type: e.st === 'activo' ? 'danger' : 'success',
      cb: () => {
        const next = toggleUser(e.id)
        toast(`Usuario ${e.name} ${next === 'activo' ? 'reactivado' : 'dado de baja'}.`, next === 'activo' ? 'ok' : 'wa')
      },
    })

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Usuarios</div>
          <div className="ph-s">{emps.filter((e) => e.st === 'activo').length} usuarios activos</div>
        </div>
        <button className="btn-pr" onClick={openNew}>
          <IconPlus size={13} />Nuevo usuario
        </button>
      </div>

      <div className="fb">
        <input className="fi" placeholder="Buscar por nombre, legajo o email..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Email</th>
                <th>Legajo</th>
                <th>Rol <span className="cursor-help text-tm" data-tip="Admin: acceso total. Empleado: solo portal propio. Contador: ve datos de preliquidación.">ⓘ</span></th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const sh = e.sid ? gShift(e.sid) : null
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-[9px]">
                        <Avatar emp={e} />
                        <span className="font-semibold">{e.name}</span>
                      </div>
                    </td>
                    <td className="text-[12px] text-t2">{e.email}</td>
                    <td>
                      <code className="rounded bg-bg px-[6px] py-[2px] text-[12px]">{e.leg}</code>
                    </td>
                    <td><RoleBadge role={e.role} /></td>
                    <td className="text-[12px] text-t2">
                      {sh ? (
                        <>
                          {sh.name}
                          <br />
                          <span className="text-tm">{sh.entry}–{sh.exit}</span>
                        </>
                      ) : (
                        <span className="text-tm">—</span>
                      )}
                    </td>
                    <td><StatusBadge st={e.st} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-gh btn-sm" onClick={() => openEdit(e)} title="Editar"><IconEdit size={13} /></button>
                        <button
                          className="btn-gh btn-sm"
                          style={{ color: e.st === 'activo' ? 'var(--er)' : 'var(--ok)' }}
                          onClick={() => toggle(e)}
                          title={e.st === 'activo' ? 'Dar de baja' : 'Reactivar'}
                        >
                          {e.st === 'activo' ? <IconXCircle size={13} /> : <IconCheck size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button className="btn-ol" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-pr" onClick={save}>Guardar usuario</button>
          </>
        }
      >
        <div className="fg">
          <label className="fl">Nombre completo</label>
          <input className="fin" placeholder="Apellido, Nombre" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div className="fg">
          <label className="fl">Email</label>
          <input className="fin" type="email" placeholder="usuario@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="fl">Legajo</label>
            <input className="fin" placeholder="000" value={form.leg} onChange={(e) => setForm({ ...form, leg: e.target.value })} />
          </div>
          <div className="fg">
            <label className="fl">Rol</label>
            <select className="fsel" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Role })}>
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
              <option value="contador">Contador</option>
            </select>
          </div>
        </div>
        <div className="fg">
          <label className="fl">
            Horario asignado{' '}
            <span className="cursor-help text-[11px] text-tm" data-tip="Define el turno de trabajo del empleado. Determina horario esperado y umbral para calcular tardanzas y horas extra.">ⓘ</span>
          </label>
          <select className="fsel" value={form.sid} onChange={(e) => setForm({ ...form, sid: +e.target.value })}>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.entry}–{s.exit})</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  )
}
