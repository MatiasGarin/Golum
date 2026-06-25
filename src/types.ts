export type Role = 'admin' | 'empleado' | 'contador'
export type UserStatus = 'activo' | 'inactivo'
export type NovStatus = 'pendiente' | 'aprobada' | 'rechazada'
export type NovOrigen = 'automática' | 'manual'
export type FichType = 'entrada' | 'salida' | 'inicio-descanso' | 'fin-descanso'
export type FichOrigen = 'biométrico' | 'manual' | 'qr'

export interface Employee {
  id: number
  name: string
  ini: string
  email: string
  leg: string
  role: Role
  st: UserStatus
  sid: number | null
  av: number
}

export type ShiftKind = 'fijo' | 'rotativo' | 'flexible'

/** Campos comunes a todo horario (tabla base "Horario"). */
interface ShiftBase {
  id: number
  kind: ShiftKind
  name: string // nombre_horario
  st: UserStatus // estado (activo / inactivo)
  days: number[] // dias_semana (1=Lun .. 7=Dom)
  bk: number // tiempo_descanso (min)
}

/** Horario fijo: misma franja todos los días asignados (tabla "HorarioFijo"). */
export interface ShiftFijo extends ShiftBase {
  kind: 'fijo'
  entry: string // hora_entrada_esperada
  exit: string // hora_salida_esperada
  tolE: number // tolerancia entrada (min)
  tolS: number // tolerancia salida (min)
  heT: number // umbral horas extra (min)
}

/** Horario rotativo: igual al fijo pero válido sólo dentro de un período (tabla "HorarioRotativo"). */
export interface ShiftRotativo extends ShiftBase {
  kind: 'rotativo'
  entry: string
  exit: string
  tolE: number
  tolS: number
  heT: number
  periodStart: string // fecha_comienzo_periodo (YYYY-MM-DD)
  periodEnd: string // fecha_fin_periodo (YYYY-MM-DD)
}

/** Horario flexible: cumplir X horas dentro de una ventana (tabla "HorarioFlexible"). */
export interface ShiftFlexible extends ShiftBase {
  kind: 'flexible'
  windowStart: string // hora_comienzo_ventana
  windowEnd: string // hora_fin_ventana
  hours: number // horas_a_cumplir
}

export type Shift = ShiftFijo | ShiftRotativo | ShiftFlexible

/** True si el horario tiene franja fija de entrada/salida (fijo o rotativo). */
export function hasFixedHours(s: Shift): s is ShiftFijo | ShiftRotativo {
  return s.kind === 'fijo' || s.kind === 'rotativo'
}

export interface Fichada {
  id: number
  eId: number
  type: FichType
  dt: string // "YYYY-MM-DD HH:mm"
  org: FichOrigen
}

export interface Novedad {
  id: number
  eId: number
  type: string
  d1: string
  d2: string | null
  qty: string
  org: NovOrigen
  st: NovStatus
  obs: string | null
  resBy: string | null
  resAt: string | null
  just?: string | null
}

export interface Solicitud {
  id: number
  eId: number
  type: string
  sentAt: string
  period: string
  st: NovStatus
  resp: string | null
}

export interface ResRow {
  eId: number
  dt: number
  aus: string
  tMin: number
  he50: number
  he100: number
}
