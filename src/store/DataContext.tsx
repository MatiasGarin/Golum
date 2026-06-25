import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Employee, FichType, Fichada, Novedad, Shift, ShiftKind, Solicitud } from '../types'
import { EMPS, SHIFTS, FICHADAS, NOVEDADES, SOLICITUDES, TODAY, ADMIN_ID, EMP_ID } from '../data/seed'
import { detectTardanza, detectHorasExtra, detectExcesoDescanso, detectSalidaAnticipada, evalFlexible, isWithinPeriod, diasLicencia } from '../lib/rules'
import { fd } from '../lib/format'
import { usePersistentState } from '../hooks/usePersistentState'

export type EmpFichajeState = 'sin-entrada' | 'en-jornada' | 'en-descanso' | 'jornada-completa'

interface FichajeResult {
  type: FichType
  tardanza?: number
  horasExtra?: number
  excesoDescanso?: number
  sinDescanso?: boolean
  salidaAnticipada?: number
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
  eBreakStart: string | null
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
  saveShift: (shift: Shift) => void
  addShift: (kind: ShiftKind) => number
  // employee actions
  fichar: (type: FichType, hora: string) => FichajeResult
  addSolicitudJustificativo: () => void
  addSolicitudLicencia: (tipo: string, fi: string, ff: string) => void
}

const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  // Datos de dominio: persistidos en localStorage para sobrevivir a recargas.
  const [emps, setEmps] = usePersistentState<Employee[]>('emps', () => EMPS.map((e) => ({ ...e })))
  const [shifts, setShifts] = usePersistentState<Shift[]>('shifts', () => SHIFTS.map((s) => ({ ...s, days: [...s.days] })))
  const [fichadas, setFichadas] = usePersistentState<Fichada[]>('fichadas', () => FICHADAS.map((f) => ({ ...f })))
  const [novedades, setNovedades] = usePersistentState<Novedad[]>('novedades', () => NOVEDADES.map((n) => ({ ...n })))
  const [solicitudes, setSolicitudes] = usePersistentState<Solicitud[]>('solicitudes', () => SOLICITUDES.map((s) => ({ ...s })))
  // Identidad de sesión: NO se persiste (se vuelve a entrar tras recargar).
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)

  // Sesión de fichaje del empleado: se persiste para mantener coherencia con las fichadas.
  const [eState, setEState] = usePersistentState<EmpFichajeState>('eState', () => 'sin-entrada')
  const [eEntry, setEEntry] = usePersistentState('eEntry', () => '')
  const [eExit, setEExit] = usePersistentState<string | null>('eExit', () => null)
  const [eBreakStart, setEBreakStart] = usePersistentState<string | null>('eBreakStart', () => null)
  const [eBreakTaken, setEBreakTaken] = usePersistentState('eBreakTaken', () => false)

  // Contador de IDs derivado de los datos restaurados, para no colisionar tras recargar.
  const nextId = useRef(0)
  if (nextId.current === 0) {
    const ids = [...emps.map((e) => e.id), ...shifts.map((s) => s.id), ...fichadas.map((f) => f.id), ...novedades.map((n) => n.id), ...solicitudes.map((s) => s.id)]
    nextId.current = Math.max(300, ...ids) + 1
  }
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

  // Hora "HH:mm" de la entrada ya registrada de un empleado en una fecha (o null).
  const findEntryHora = useCallback(
    (eId: number, fecha: string): string | null => {
      const f = fichadas.find((x) => x.eId === eId && x.type === 'entrada' && x.dt.startsWith(fecha))
      return f ? f.dt.split(' ')[1] : null
    },
    [fichadas],
  )

  const pushNov = useCallback((eId: number, type: string, fecha: string, qty: string, obs: string) => {
    setNovedades((prev) => [
      ...prev,
      { id: newId(), eId, type, d1: fecha, d2: null, qty, org: 'automática', st: 'pendiente', obs, resBy: null, resAt: null },
    ])
  }, [])

  const addFichadaManual = useCallback(
    (eId: number, type: 'entrada' | 'salida', fecha: string, hora: string): FichajeResult => {
      const entryHora = type === 'salida' ? findEntryHora(eId, fecha) : null
      setFichadas((prev) => [...prev, { id: newId(), eId, type, dt: `${fecha} ${hora}`, org: 'manual' }])
      const result: FichajeResult = { type }
      const sh = gShift(emps.find((e) => e.id === eId)?.sid ?? -1)
      // Rotativo fuera de su período de vigencia: no se interpreta.
      if (!sh || !isWithinPeriod(fecha, sh)) return result

      if (type === 'entrada') {
        const diff = detectTardanza(hora, sh)
        if (diff > 0) {
          pushNov(eId, 'Tardanza', fecha, `${diff} min`, 'Generada automáticamente al registrar la fichada.')
          result.tardanza = diff
        }
      } else if (sh.kind === 'flexible') {
        if (entryHora) {
          const { shortfall, overtime } = evalFlexible(entryHora, hora, sh)
          if (overtime > 0) {
            pushNov(eId, 'Horas extra 50%', fecha, `${overtime} min`, 'Excedente sobre las horas a cumplir (jornada flexible).')
            result.horasExtra = overtime
          } else if (shortfall > 0) {
            pushNov(eId, 'Jornada incompleta', fecha, `${shortfall} min`, 'No completó las horas a cumplir dentro de la ventana flexible.')
          }
        }
      } else {
        const diff = detectHorasExtra(hora, sh)
        if (diff > 0) {
          pushNov(eId, 'Horas extra 50%', fecha, `${diff} min`, 'Generada automáticamente al registrar la fichada de salida.')
          result.horasExtra = diff
        }
      }
      return result
    },
    [emps, gShift, findEntryHora, pushNov],
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

  const saveShift = useCallback((shift: Shift) => {
    setShifts((prev) => prev.map((s) => (s.id === shift.id ? shift : s)))
  }, [])

  const addShift = useCallback((kind: ShiftKind) => {
    let nid = 100
    setShifts((prev) => {
      nid = 100 + prev.length
      const base = { id: nid, name: 'Nuevo Turno', st: 'activo' as const, days: [1, 2, 3, 4, 5], bk: 30 }
      const shift: Shift =
        kind === 'flexible'
          ? { ...base, kind: 'flexible', windowStart: '07:00', windowEnd: '20:00', hours: 8 }
          : kind === 'rotativo'
            ? { ...base, kind: 'rotativo', entry: '09:00', exit: '17:00', tolE: 5, tolS: 10, heT: 30, periodStart: TODAY, periodEnd: TODAY }
            : { ...base, kind: 'fijo', entry: '09:00', exit: '17:00', tolE: 5, tolS: 10, heT: 30 }
      return [...prev, shift]
    })
    return nid
  }, [])

  // Employee self-service fichaje (always Juan Pérez / EMP_ID, Turno Administrativo).
  const fichar = useCallback((type: FichType, hora: string): FichajeResult => {
    const date = TODAY
    setFichadas((prev) => [...prev, { id: newId(), eId: EMP_ID, type, dt: `${date} ${hora}`, org: 'biométrico' }])
    const sh = gShift(EMPS.find((e) => e.id === EMP_ID)?.sid ?? -1)!
    const result: FichajeResult = { type }
    const interpret = isWithinPeriod(date, sh)

    if (type === 'entrada') {
      setEEntry(hora)
      setEState('en-jornada')
      setEBreakStart(null)
      setEBreakTaken(false)
      const diff = interpret ? detectTardanza(hora, sh) : 0
      if (diff > 0) {
        pushNov(EMP_ID, 'Tardanza', date, `${diff} min`, 'Generada automáticamente al fichar.')
        result.tardanza = diff
      }
    } else if (type === 'inicio-descanso') {
      setEBreakStart(hora)
      setEState('en-descanso')
    } else if (type === 'fin-descanso') {
      setEState('en-jornada')
      setEBreakTaken(true)
      if (interpret && eBreakStart) {
        const exc = detectExcesoDescanso(eBreakStart, hora, sh)
        if (exc > 0) {
          pushNov(EMP_ID, 'Exceso de descanso', date, `${exc} min`, `El descanso superó los ${sh.bk} min permitidos del horario.`)
          result.excesoDescanso = exc
        }
      }
    } else {
      // salida
      setEExit(hora)
      setEState('jornada-completa')
      // Jornada sin descanso: el horario exige pausa pero no se registró ninguna.
      if (interpret && sh.bk > 0 && !eBreakTaken) {
        pushNov(EMP_ID, 'Jornada sin descanso', date, '—', 'No se registró pausa de descanso en una jornada que la requiere.')
        result.sinDescanso = true
      }
      if (interpret && sh.kind === 'flexible') {
        const { shortfall, overtime } = evalFlexible(eEntry, hora, sh)
        if (overtime > 0) {
          pushNov(EMP_ID, 'Horas extra 50%', date, `${overtime} min`, 'Excedente sobre las horas a cumplir (jornada flexible).')
          result.horasExtra = overtime
        } else if (shortfall > 0) {
          pushNov(EMP_ID, 'Jornada incompleta', date, `${shortfall} min`, 'No completó las horas a cumplir dentro de la ventana flexible.')
        }
      } else if (interpret) {
        const diff = detectHorasExtra(hora, sh)
        if (diff > 0) {
          pushNov(EMP_ID, 'Horas extra 50%', date, `${diff} min`, 'Generada automáticamente al fichar salida.')
          result.horasExtra = diff
        }
        const ant = detectSalidaAnticipada(hora, sh)
        if (ant > 0) {
          pushNov(EMP_ID, 'Salida anticipada', date, `${ant} min`, 'Salida registrada antes del horario esperado del turno.')
          result.salidaAnticipada = ant
        }
      }
    }
    return result
  }, [gShift, eEntry, eBreakStart, eBreakTaken, pushNov])

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
      eState, eEntry, eExit, eBreakStart,
      gEmp, gShift, login, logout,
      toggleUser, addFichadaManual, addNovedadManual, approveNov, rejectNov, saveShift, addShift,
      fichar, addSolicitudJustificativo, addSolicitudLicencia,
    }),
    [emps, shifts, fichadas, novedades, solicitudes, currentUser, eState, eEntry, eExit, eBreakStart, gEmp, gShift, login, logout, toggleUser, addFichadaManual, addNovedadManual, approveNov, rejectNov, saveShift, addShift, fichar, addSolicitudJustificativo, addSolicitudLicencia],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData must be used within DataProvider')
  return v
}
