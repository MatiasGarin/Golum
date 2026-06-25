// Date / formatting helpers ported from mockup.html utils.

import type { FichType, Shift, ShiftKind } from '../types'

export const p2 = (n: number) => String(n).padStart(2, '0')

/** Etiqueta legible del tipo de horario. */
export const shiftKindLabel = (k: ShiftKind): string =>
  ({ fijo: 'Fijo', rotativo: 'Rotativo', flexible: 'Flexible' })[k]

/** Resumen corto de la franja horaria según el tipo. Ej: "08:00–16:00", "Flexible · 8h en 07:00–20:00". */
export function shiftSummary(s: Shift): string {
  if (s.kind === 'flexible') return `${s.hours}h en ${s.windowStart}–${s.windowEnd}`
  return `${s.entry}–${s.exit}`
}

/** Etiqueta (con flecha/ícono) y color de badge para cada tipo de fichada. */
export function fichTypeMeta(t: FichType): { label: string; color: 'gn' | 'rd' | 'am' | 'bl' | 'pu' | 'gy' } {
  const map = {
    entrada: { label: '↗ Entrada', color: 'bl' },
    salida: { label: '↙ Salida', color: 'gn' },
    'inicio-descanso': { label: '⏸ Inicio descanso', color: 'am' },
    'fin-descanso': { label: '▶ Fin descanso', color: 'pu' },
  } as const
  return map[t]
}

/** "2026-06-18" -> "18/06/2026"; null/empty -> "—" */
export const fd = (d: string | null | undefined): string => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

/** day of week for "YYYY-MM-DD" (0=Sun..6=Sat) */
export const dw = (s: string): number => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export const isWD = (s: string): boolean => {
  const d = dw(s)
  return d >= 1 && d <= 5
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const mName = (m: number, y: number): string => `${MONTHS[m - 1]} ${y}`

/** Tooltip text for each novedad type. */
export function novTip(t: string): string {
  const m: Record<string, string> = {
    Tardanza: 'El empleado ingresó después del horario de entrada + tolerancia configurada.',
    Ausencia: 'No se presentó. Cuenta como injustificada salvo que tenga justificación aprobada.',
    'Salida anticipada': 'Se retiró antes del horario de salida menos la tolerancia.',
    'Exceso de descanso': 'La pausa superó el tiempo de descanso permitido del horario.',
    'Jornada incompleta': 'No completó las horas a cumplir dentro de la ventana flexible.',
    'Jornada sin descanso': 'No registró la pausa que el horario exige (sólo informativo).',
    'Horas extra 50%': 'Trabajó más allá del horario de salida (día normal). Requiere autorización.',
    'Horas extra 100%': 'Horas extra en día feriado o descanso (se pagan al 100%). Requiere autorización.',
    'Licencia médica': 'Ausencia por salud, avalada con certificado médico.',
    'Licencia examen': 'Ausencia por examen académico con documentación.',
    Vacaciones: 'Período de descanso anual remunerado.',
    'Suspensión disciplinaria': 'Medida disciplinaria sin goce de sueldo.',
    'Permiso especial': 'Ausencia autorizada por el empleador.',
  }
  return m[t] || ''
}

/** Hint + quantity label shown in the "cargar novedad" modal per type. */
export function novTipoMeta(t: string): { hint: string; qtyLabel: string } {
  const hints: Record<string, string> = {
    Tardanza: 'Se mide en minutos de retraso sobre la hora de entrada + tolerancia.',
    Ausencia: 'Se cuenta en días. Injustificada salvo que se apruebe una justificación.',
    'Salida anticipada': 'Minutos que se retiró antes del horario de salida.',
    'Exceso de descanso': 'Minutos que la pausa superó el descanso permitido.',
    'Horas extra 50%': 'Minutos extra trabajados en día laboral. Requiere autorización; al 50% adicional.',
    'Horas extra 100%': 'Minutos en feriado o descanso. Requiere autorización; al 100% adicional.',
    'Licencia médica': 'Días de licencia por enfermedad con certificado médico.',
    'Licencia examen': 'Días de licencia por examen académico.',
    Vacaciones: 'Días de vacaciones anuales según convenio.',
    'Suspensión disciplinaria': 'Días sin goce de sueldo por medida disciplinaria.',
    'Permiso especial': 'Días autorizados por el empleador.',
  }
  const minTypes = ['Tardanza', 'Salida anticipada', 'Exceso de descanso', 'Horas extra 50%', 'Horas extra 100%']
  return {
    hint: hints[t] || '',
    qtyLabel: minTypes.includes(t) ? 'Cantidad (minutos)' : 'Cantidad (días)',
  }
}

export const NOVEDAD_TYPES = [
  'Tardanza',
  'Salida anticipada',
  'Ausencia',
  'Horas extra 50%',
  'Horas extra 100%',
  'Licencia médica',
  'Licencia examen',
  'Vacaciones',
  'Suspensión disciplinaria',
  'Permiso especial',
]
