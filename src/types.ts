export type Role = 'admin' | 'empleado' | 'contador'
export type UserStatus = 'activo' | 'inactivo'
export type NovStatus = 'pendiente' | 'aprobada' | 'rechazada'
export type NovOrigen = 'automática' | 'manual'
export type FichType = 'entrada' | 'salida'
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

export interface Shift {
  id: number
  name: string
  entry: string
  exit: string
  days: number[]
  tolE: number
  tolS: number
  heT: number
  bk: number
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
