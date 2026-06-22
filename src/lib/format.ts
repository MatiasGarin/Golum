// Date / formatting helpers ported from mockup.html utils.

export const p2 = (n: number) => String(n).padStart(2, '0')

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
    'Ausencia injustificada': 'No se presentó y no aportó justificación válida.',
    'Ausencia justificada': 'No se presentó pero presentó documentación válida.',
    'Horas extra 50%': 'Trabajó más de 30 min después del horario de salida (día normal).',
    'Horas extra 100%': 'Horas extra en día feriado o descanso (se pagan al 100%).',
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
    'Ausencia injustificada': 'Se cuenta en días completos. Sin documentación de respaldo.',
    'Ausencia justificada': 'Se cuenta en días. Requiere documentación adjunta.',
    'Horas extra 50%': 'Minutos extra trabajados en día laboral. Retribución al 50% adicional.',
    'Horas extra 100%': 'Minutos en feriado o descanso. Retribución al 100% adicional.',
    'Licencia médica': 'Días de licencia por enfermedad con certificado médico.',
    'Licencia examen': 'Días de licencia por examen académico.',
    Vacaciones: 'Días de vacaciones anuales según convenio.',
    'Suspensión disciplinaria': 'Días sin goce de sueldo por medida disciplinaria.',
    'Permiso especial': 'Días autorizados por el empleador.',
  }
  const minTypes = ['Tardanza', 'Horas extra 50%', 'Horas extra 100%']
  return {
    hint: hints[t] || '',
    qtyLabel: minTypes.includes(t) ? 'Cantidad (minutos)' : 'Cantidad (días)',
  }
}

export const NOVEDAD_TYPES = [
  'Tardanza',
  'Ausencia injustificada',
  'Ausencia justificada',
  'Horas extra 50%',
  'Horas extra 100%',
  'Licencia médica',
  'Licencia examen',
  'Vacaciones',
  'Suspensión disciplinaria',
  'Permiso especial',
]
