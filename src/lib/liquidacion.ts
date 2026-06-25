// Motor de liquidación: consolida fichadas + novedades aprobadas del período en
// filas de preliquidación (`ResRow`) por empleado. Función pura y parametrizable
// (sin umbrales hardcodeados: los umbrales ya se aplicaron al detectar la novedad,
// acá sólo se agregan los efectos). Ver docs/motor-liquidacion.md.

import type { Employee, Fichada, Novedad, ResRow } from '../types'

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
 * - totales por tipo de novedad, contando sólo las **aprobadas**.
 * Una tardanza con justificación (`just` con texto) se perdona: no suma a `tMin`.
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
    if (n.eId !== eId || n.st !== 'aprobada' || !n.d1.startsWith(periodo)) continue
    switch (n.type) {
      case 'Tardanza':
        if (!n.just || !n.just.trim()) row.tMin += qtyMin(n.qty)
        break
      case 'Horas extra 50%':
        row.he50 += qtyMin(n.qty)
        break
      case 'Horas extra 100%':
        row.he100 += qtyMin(n.qty)
        break
      case 'Salida anticipada':
        row.sAnt += qtyMin(n.qty)
        break
      case 'Exceso de descanso':
        row.exD += qtyMin(n.qty)
        break
      case 'Jornada incompleta':
        row.jInc += qtyMin(n.qty)
        break
      case 'Ausencia injustificada':
        inj += qtyDias(n.qty)
        break
      case 'Jornada sin descanso':
        // Incidente informativo, sin impacto en la liquidación.
        break
      default:
        // Ausencia justificada / Licencia * / Vacaciones / Permiso especial /
        // Suspensión disciplinaria → ausencia justificada (licencia).
        if (n.type === 'Ausencia justificada' || n.type.startsWith('Licencia') || n.type === 'Vacaciones' || n.type === 'Permiso especial' || n.type === 'Suspensión disciplinaria') {
          lic += qtyDias(n.qty)
        }
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
