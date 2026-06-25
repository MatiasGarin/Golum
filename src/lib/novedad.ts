// Clasificación de novedades por su tratamiento en el flujo de aprobación.
// Compartido entre el motor de consolidación (lib/liquidacion.ts) y la UI.
//
// Dos polaridades distintas de "aprobación":
//  - Horas Extra → requieren AUTORIZACIÓN del admin para entrar al reporte/pago
//    (gate sobre `st`: pendiente → aprobada/rechazada).
//  - Desvíos (tardanza, salida anticipada, ausencia, exceso, jornada incompleta)
//    → quedan REGISTRADOS en firme y cuentan siempre; lo que se aprueba es la
//    JUSTIFICACIÓN (gate sobre `justSt`), que al aprobarse los excluye del reporte.

import type { Novedad } from '../types'

/** Horas extra: requieren autorización del admin para pagarse/computarse. */
export const requiereAutorizacion = (type: string): boolean =>
  type === 'Horas extra 50%' || type === 'Horas extra 100%'

/** Desvíos que el empleado puede justificar (una justif. aprobada los excluye del reporte). */
export const esJustificable = (type: string): boolean =>
  type === 'Tardanza' ||
  type === 'Salida anticipada' ||
  type === 'Ausencia' ||
  type === 'Exceso de descanso' ||
  type === 'Jornada incompleta'

/** Ausencias que ya son justificadas por su naturaleza (cargadas con su documentación). */
export const esLicencia = (type: string): boolean =>
  type === 'Licencia médica' ||
  type === 'Licencia examen' ||
  type === 'Vacaciones' ||
  type === 'Permiso especial' ||
  type === 'Suspensión disciplinaria'

/** Ausencia de día completo (genérica o licencia): cuenta como justificada/injustificada. */
export const esAusencia = (type: string): boolean => type === 'Ausencia' || esLicencia(type)

/**
 * True si la novedad tiene algo que el admin debe resolver:
 *  - una Hora Extra esperando autorización, o
 *  - un desvío con justificación pendiente.
 */
export const pendienteDeResolucion = (n: Novedad): boolean =>
  (requiereAutorizacion(n.type) && n.st === 'pendiente') || n.justSt === 'pendiente'
