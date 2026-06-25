import type { Shift, ShiftFlexible } from '../types'

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Tardanza: entrada posterior a (hora de entrada + tolerancia).
 * Sólo aplica a horarios con franja fija (fijo / rotativo). El flexible no
 * tiene hora de entrada esperada, por lo que nunca genera tardanza.
 * Devuelve los minutos de retraso (>0) o 0 si fue puntual.
 */
export function detectTardanza(entryTime: string, shift: Shift): number {
  if (shift.kind === 'flexible') return 0
  const diff = toMin(entryTime) - toMin(shift.entry) - shift.tolE
  return diff > 0 ? diff : 0
}

/**
 * Horas extra 50%: salida posterior a (hora de salida + tolerancia), sólo
 * cuenta cuando supera el umbral de HE (heT). Devuelve minutos extra o 0.
 * Para el flexible las horas extra se calculan con evalFlexible (excedente
 * sobre las horas a cumplir), no acá.
 */
export function detectHorasExtra(exitTime: string, shift: Shift): number {
  if (shift.kind === 'flexible') return 0
  const diff = toMin(exitTime) - toMin(shift.exit) - shift.tolS
  return diff > shift.heT ? diff : 0
}

/**
 * Salida anticipada: salida antes de (hora de salida − tolerancia de salida).
 * Solo aplica a horarios con franja fija (fijo / rotativo). Devuelve los minutos
 * de adelanto (>0) o 0 si salió en horario. El flexible no tiene salida fija.
 */
export function detectSalidaAnticipada(exitTime: string, shift: Shift): number {
  if (shift.kind === 'flexible') return 0
  const diff = toMin(shift.exit) - shift.tolS - toMin(exitTime)
  return diff > 0 ? diff : 0
}

export interface FlexibleEval {
  worked: number // minutos efectivamente trabajados dentro de la ventana
  target: number // minutos que debía cumplir (horas_a_cumplir * 60)
  shortfall: number // minutos faltantes para completar la jornada (0 si cumplió)
  overtime: number // minutos por encima de la jornada (0 si no excedió)
}

/**
 * Evalúa una jornada flexible: cuánto trabajó dentro de la ventana permitida
 * frente a las horas a cumplir. El tiempo fuera de la ventana no computa.
 */
export function evalFlexible(entryTime: string, exitTime: string, shift: ShiftFlexible): FlexibleEval {
  const start = Math.max(toMin(entryTime), toMin(shift.windowStart))
  const end = Math.min(toMin(exitTime), toMin(shift.windowEnd))
  const worked = Math.max(0, end - start)
  const target = shift.hours * 60
  return {
    worked,
    target,
    shortfall: Math.max(0, target - worked),
    overtime: Math.max(0, worked - target),
  }
}

/**
 * Para horarios rotativos, true si la fecha cae dentro del período de vigencia.
 * Los demás tipos están siempre vigentes. Comparación lexicográfica sobre
 * fechas "YYYY-MM-DD" (válida porque están zero-padded).
 */
export function isWithinPeriod(date: string, shift: Shift): boolean {
  if (shift.kind !== 'rotativo') return true
  return date >= shift.periodStart && date <= shift.periodEnd
}

/**
 * Exceso de descanso: minutos que la pausa (inicio → fin) supera el tiempo de
 * descanso configurado del horario (`bk`). Devuelve los minutos de exceso (>0)
 * o 0 si el descanso estuvo dentro de lo permitido. Si `bk` es 0 nunca excede.
 */
export function detectExcesoDescanso(inicio: string, fin: string, shift: Shift): number {
  if (shift.bk <= 0) return 0
  const dur = toMin(fin) - toMin(inicio)
  const diff = dur - shift.bk
  return diff > 0 ? diff : 0
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
