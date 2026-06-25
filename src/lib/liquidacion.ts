// Motor de liquidación: consolida fichadas + novedades del período en filas de
// preliquidación (`ResRow`) por empleado. Función pura y parametrizable (sin
// umbrales hardcodeados: los umbrales ya se aplicaron al detectar la novedad,
// acá sólo se agregan los efectos). Ver docs/motor-liquidacion.md.
//
// Reglas de cómputo (nuevo modelo):
//  - Desvíos (tardanza, salida anticipada, exceso, jornada incompleta): quedan
//    registrados en firme y SUMAN siempre, salvo que tengan justificación
//    aprobada (`justSt === 'aprobada'`), en cuyo caso se excluyen.
//  - Ausencias (genéricas o licencias): cuentan como justificada (lic) si la
//    justificación está aprobada; si no, como injustificada (inj).
//  - Horas extra: sólo computan si fueron AUTORIZADAS (`st === 'aprobada'`).

import type { Employee, Fichada, Novedad, ResRow } from '../types'
import { esAusencia } from './novedad'

/** Entero inicial de una cantidad tipo "6 min" / "45 min". 0 si no parsea. */
export function qtyMin(qty: string): number {
  const n = parseInt(qty, 10)
  return Number.isNaN(n) ? 0 : n
}

/** Entero inicial de una cantidad tipo "1 día" / "2 días". 0 si no parsea. */
export function qtyDias(qty: string): number {
  const n = parseInt(qty, 10)
  return Number.isNaN(n) ? 0 : n
}

/** Formato de la columna ausencias del seed: "0" / "1 inj." / "2 lic." / "1 inj. · 2 lic.". */
export function formatAus(inj: number, lic: number): string {
  const parts: string[] = []
  if (inj > 0) parts.push(`${inj} inj.`)
  if (lic > 0) parts.push(`${lic} lic.`)
  return parts.length ? parts.join(' · ') : '0'
}

interface ConsolidarInput {
  fichadas: Fichada[]
  novedades: Novedad[]
}

/**
 * Consolida un empleado en un período ("YYYY-MM"):
 * - días trabajados = fechas distintas con fichada de entrada,
 * - totales por tipo de novedad según las reglas del encabezado.
 */
export function consolidarPeriodo(eId: number, periodo: string, { fichadas, novedades }: ConsolidarInput): ResRow {
  const diasEntrada = new Set(
    fichadas
      .filter((f) => f.eId === eId && f.type === 'entrada' && f.dt.startsWith(periodo))
      .map((f) => f.dt.slice(0, 10)),
  )

  const row: ResRow = { eId, dt: diasEntrada.size, aus: '0', tMin: 0, he50: 0, he100: 0, sAnt: 0, exD: 0, jInc: 0 }
  let inj = 0
  let lic = 0

  for (const n of novedades) {
    if (n.eId !== eId || !n.d1.startsWith(periodo)) continue
    // Un desvío con justificación aprobada se excluye del reporte.
    const justificada = n.justSt === 'aprobada'

    // Ausencias (genéricas o licencias): justificadas si la justif. está aprobada.
    if (esAusencia(n.type)) {
      if (justificada) lic += qtyDias(n.qty)
      else inj += qtyDias(n.qty)
      continue
    }

    switch (n.type) {
      case 'Tardanza':
        if (!justificada) row.tMin += qtyMin(n.qty)
        break
      case 'Salida anticipada':
        if (!justificada) row.sAnt += qtyMin(n.qty)
        break
      case 'Exceso de descanso':
        if (!justificada) row.exD += qtyMin(n.qty)
        break
      case 'Jornada incompleta':
        if (!justificada) row.jInc += qtyMin(n.qty)
        break
      case 'Horas extra 50%':
        // Sólo computa si el admin autorizó la hora extra.
        if (n.st === 'aprobada') row.he50 += qtyMin(n.qty)
        break
      case 'Horas extra 100%':
        if (n.st === 'aprobada') row.he100 += qtyMin(n.qty)
        break
      case 'Jornada sin descanso':
        // Incidente informativo, sin impacto en la liquidación.
        break
    }
  }

  row.aus = formatAus(inj, lic)
  return row
}

interface ConsolidarTodosInput extends ConsolidarInput {
  emps: Employee[]
}

/** Consolida a todos los empleados activos (role 'empleado') del período. */
export function consolidarTodos(periodo: string, { emps, fichadas, novedades }: ConsolidarTodosInput): ResRow[] {
  return emps
    .filter((e) => e.role === 'empleado' && e.st === 'activo')
    .map((e) => consolidarPeriodo(e.id, periodo, { fichadas, novedades }))
}
