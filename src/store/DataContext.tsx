import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Employee, Fichada, Novedad, Shift, Solicitud } from '../types'
import { EMPS, SHIFTS, FICHADAS, NOVEDADES, SOLICITUDES, TODAY, ADMIN_ID, EMP_ID } from '../data/seed'
import { detectTardanza, detectHorasExtra, diasLicencia } from '../lib/rules'
import { fd } from '../lib/format'

export type EmpFichajeState = 'sin-entrada' | 'en-jornada' | 'jornada-completa'

interface FichajeResult {
  type: 'entrada' | 'salida'
  tardanza?: number
  horasExtra?: number
}

interface DataCtx {
  emps: Employee[]
  shifts: Shift[]
  fichadas: Fichada[]
  novedades: Novedad[]
  solicitudes: Solicitud[]
  currentUser: Employee | null
  // employee fichaje state
  eState: EmpFichajeState
  eEntry: string
  eExit: string | null
  // helpers
  gEmp: (id: number) => Employee | undefined
  gShift: (id: number) => Shift | undefined
  // auth
  login: (role: 'admin' | 'empleado') => void
  logout: () => void
  // admin actions
  toggleUser: (id: number) => 'activo' | 'inactivo'
  addFichadaManual: (eId: number, type: 'entrada' | 'salida', fecha: string, hora: string) => FichajeResult
  addNovedadManual: (n: { eId: number; type: string; d1: string; d2: string | null; qty: string; obs: string | null; just: string | null }) => void
  approveNov: (id: number) => void
  rejectNov: (id: number) => void
  saveShift: (id: number, fields: Partial<Shift>) => void
  addShift: () => number
  // employee actions
  fichar: (type: 'entrada' | 'salida', hora: string) => FichajeResult
  addSolicitudJustificativo: () => void
  addSolicitudLicencia: (tipo: string, fi: string, ff: string) => void
}

const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [emps, setEmps] = useState<Employee[]>(() => EMPS.map((e) => ({ ...e })))
  const [shifts, setShifts] = useState<Shift[]>(() => SHIFTS.map((s) => ({ ...s, days: [...s.days] })))
  const [fichadas, setFichadas] = useState<Fichada[]>(() => FICHADAS.map((f) => ({ ...f })))
  const [novedades, setNovedades] = useState<Novedad[]>(() => NOVEDADES.map((n) => ({ ...n })))
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => SOLICITUDES.map((s) => ({ ...s })))
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)

  const [eState, setEState] = useState<EmpFichajeState>('en-jornada')
  const [eEntry, setEEntry] = useState('09:00')
  const [eExit, setEExit] = useState<string | null>(null)

  const nextId = useRef(300)
  const newId = () => nextId.current++

  const gEmp = useCallback((id: number) => emps.find((e) => e.id === id), [emps])
  const gShift = useCallback((id: number) => shifts.find((s) => s.id === id), [shifts])

  const login = useCallback((role: 'admin' | 'empleado') => {
    setCurrentUser(EMPS.find((e) => e.id === (role === 'admin' ? ADMIN_ID : EMP_ID)) ?? null)
  }, [])
  const logout = useCallback(() => setCurrentUser(null), [])

  const toggleUser = useCallback((id: number) => {
    let next: 'activo' | 'inactivo' = 'activo'
    setEmps((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        next = e.st === 'activo' ? 'inactivo' : 'activo'
        return { ...e, st: next }
      }),
    )
    return next
  }, [])

  const addFichadaManual = useCallback(
    (eId: number, type: 'entrada' | 'salida', fecha: string, hora: string): FichajeResult => {
      setFichadas((prev) => [...prev, { id: newId(), eId, type, dt: `${fecha} ${hora}`, org: 'manual' }])
      const result: FichajeResult = { type }
      if (type === 'entrada') {
        const sh = gShift(emps.find((e) => e.id === eId)?.sid ?? -1)
        if (sh) {
          const diff = detectTardanza(hora, sh)
          if (diff > 0) {
            setNovedades((prev) => [
              ...prev,
              { id: newId(), eId, type: 'Tardanza', d1: fecha, d2: null, qty: `${diff} min`, org: 'automática', st: 'pendiente', obs: 'Generada automáticamente al registrar la fichada.', resBy: null, resAt: null },
            ])
            result.tardanza = diff
          }
        }
      }
      return result
    },
    [emps, gShift],
  )

  const addNovedadManual = useCallback<DataCtx['addNovedadManual']>((n) => {
    setNovedades((prev) => [
      ...prev,
      { id: newId(), eId: n.eId, type: n.type, d1: n.d1, d2: n.d2, qty: n.qty, org: 'manual', st: 'pendiente', obs: n.obs, just: n.just, resBy: null, resAt: null },
    ])
  }, [])

  const resolveNov = useCallback((id: number, st: 'aprobada' | 'rechazada') => {
    setNovedades((prev) => prev.map((n) => (n.id === id ? { ...n, st, resBy: 'Rodríguez, María', resAt: TODAY } : n)))
  }, [])
  const approveNov = useCallback((id: number) => resolveNov(id, 'aprobada'), [resolveNov])
  const rejectNov = useCallback((id: number) => resolveNov(id, 'rechazada'), [resolveNov])

  const saveShift = useCallback((id: number, fields: Partial<Shift>) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s)))
  }, [])

  const addShift = useCallback(() => {
    let nid = 100
    setShifts((prev) => {
      nid = 100 + prev.length
      return [...prev, { id: nid, name: 'Nuevo Turno', entry: '09:00', exit: '17:00', days: [1, 2, 3, 4, 5], tolE: 5, tolS: 10, heT: 30, bk: 30 }]
    })
    return nid
  }, [])

  // Employee self-service fichaje (always Juan Pérez / EMP_ID, Turno Administrativo).
  const fichar = useCallback((type: 'entrada' | 'salida', hora: string): FichajeResult => {
    const date = TODAY
    setFichadas((prev) => [...prev, { id: newId(), eId: EMP_ID, type, dt: `${date} ${hora}`, org: 'biométrico' }])
    const sh = gShift(EMPS.find((e) => e.id === EMP_ID)?.sid ?? -1)!
    const result: FichajeResult = { type }
    if (type === 'entrada') {
      setEEntry(hora)
      setEState('en-jornada')
      const diff = detectTardanza(hora, sh)
      if (diff > 0) {
        setNovedades((prev) => [
          ...prev,
          { id: newId(), eId: EMP_ID, type: 'Tardanza', d1: date, d2: null, qty: `${diff} min`, org: 'automática', st: 'pendiente', obs: 'Generada automáticamente al fichar.', resBy: null, resAt: null },
        ])
        result.tardanza = diff
      }
    } else {
      setEExit(hora)
      setEState('jornada-completa')
      const diff = detectHorasExtra(hora, sh)
      if (diff > 0) {
        setNovedades((prev) => [
          ...prev,
          { id: newId(), eId: EMP_ID, type: 'Horas extra 50%', d1: date, d2: null, qty: `${diff} min`, org: 'automática', st: 'pendiente', obs: 'Generada automáticamente al fichar salida.', resBy: null, resAt: null },
        ])
        result.horasExtra = diff
      }
    }
    return result
  }, [gShift])

  const addSolicitudJustificativo = useCallback(() => {
    setSolicitudes((prev) => [...prev, { id: newId(), eId: EMP_ID, type: 'Justificativo de tardanza o ausencia', sentAt: TODAY, period: '18/06/2026', st: 'pendiente', resp: null }])
  }, [])

  const addSolicitudLicencia = useCallback((tipo: string, fi: string, ff: string) => {
    const dias = diasLicencia(fi, ff)
    setSolicitudes((prev) => [...prev, { id: newId(), eId: EMP_ID, type: 'Solicitud de licencia', sentAt: TODAY, period: `${fd(fi)} – ${fd(ff)}`, st: 'pendiente', resp: null }])
    setNovedades((prev) => [
      ...prev,
      { id: newId(), eId: EMP_ID, type: `Licencia ${tipo.toLowerCase()}`, d1: fi, d2: ff, qty: `${dias} día${dias !== 1 ? 's' : ''}`, org: 'manual', st: 'pendiente', obs: 'Originada desde solicitud del empleado.', resBy: null, resAt: null },
    ])
  }, [])

  const value = useMemo<DataCtx>(
    () => ({
      emps, shifts, fichadas, novedades, solicitudes, currentUser,
      eState, eEntry, eExit,
      gEmp, gShift, login, logout,
      toggleUser, addFichadaManual, addNovedadManual, approveNov, rejectNov, saveShift, addShift,
      fichar, addSolicitudJustificativo, addSolicitudLicencia,
    }),
    [emps, shifts, fichadas, novedades, solicitudes, currentUser, eState, eEntry, eExit, gEmp, gShift, login, logout, toggleUser, addFichadaManual, addNovedadManual, approveNov, rejectNov, saveShift, addShift, fichar, addSolicitudJustificativo, addSolicitudLicencia],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData must be used within DataProvider')
  return v
}
