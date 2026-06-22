import type { Shift } from '../types'

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Tardanza: entry later than (shift entry + entry tolerance).
 * Returns minutes of lateness (>0) or 0 if punctual.
 */
export function detectTardanza(entryTime: string, shift: Shift): number {
  const diff = toMin(entryTime) - toMin(shift.entry) - shift.tolE
  return diff > 0 ? diff : 0
}

/**
 * Horas extra 50%: exit beyond (shift exit + tolerance), only counts when it
 * exceeds the HE threshold (heT). Returns extra minutes or 0.
 * Mirrors procesarFichaje(): diff = exitMin - shiftExitMin - tolS; HE if diff > heT.
 */
export function detectHorasExtra(exitTime: string, shift: Shift): number {
  const diff = toMin(exitTime) - toMin(shift.exit) - shift.tolS
  return diff > shift.heT ? diff : 0
}

/** Inclusive day count between two "YYYY-MM-DD" dates. */
export function diasLicencia(fi: string, ff: string): number {
  const [y1, m1, d1] = fi.split('-').map(Number)
  const [y2, m2, d2] = ff.split('-').map(Number)
  const ms = new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1
}

/** Worked hours label between two "HH:mm" times, e.g. "8h 30min". */
export function horasTrabajadas(entryTime: string, exitTime: string, suffix = 'min'): string {
  const mins = toMin(exitTime) - toMin(entryTime)
  return `${Math.floor(mins / 60)}h ${mins % 60}${suffix}`
}
