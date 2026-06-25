import type { Employee, Shift, Fichada, Novedad, Solicitud, ResRow } from '../types'

// Hardcoded "today" — matches the demo data in mockup.html.
export const TODAY = '2026-06-18'
// Logged-in identities for the demo (admin = María, empleado = Juan Pérez).
export const ADMIN_ID = 1
export const EMP_ID = 6

export const EMPS: Employee[] = [
  { id: 1, name: 'Rodríguez, María', ini: 'MR', email: 'mrodriguez@empresa.com', leg: '001', role: 'admin', st: 'activo', sid: 3, av: 1 },
  { id: 2, name: 'Gómez, Carlos', ini: 'CG', email: 'cgomez@empresa.com', leg: '002', role: 'empleado', st: 'activo', sid: 1, av: 2 },
  { id: 3, name: 'López, Ana', ini: 'AL', email: 'alopez@empresa.com', leg: '003', role: 'empleado', st: 'activo', sid: 2, av: 3 },
  { id: 4, name: 'Martínez, Diego', ini: 'DM', email: 'dmartinez@empresa.com', leg: '004', role: 'empleado', st: 'activo', sid: 3, av: 4 },
  { id: 5, name: 'Fernández, Laura', ini: 'LF', email: 'lfernandez@empresa.com', leg: '005', role: 'empleado', st: 'activo', sid: 4, av: 5 },
  { id: 6, name: 'Pérez, Juan', ini: 'JP', email: 'jperez@empresa.com', leg: '006', role: 'empleado', st: 'activo', sid: 3, av: 6 },
  { id: 7, name: 'Suárez, Roberto', ini: 'RS', email: 'rsuarez@estudios.com', leg: '—', role: 'contador', st: 'activo', sid: null, av: 1 },
]

export const SHIFTS: Shift[] = [
  { id: 1, kind: 'fijo', name: 'Turno Mañana', st: 'activo', days: [1, 2, 3, 4, 5], bk: 30, entry: '08:00', exit: '16:00', tolE: 5, tolS: 10, heT: 30 },
  { id: 2, kind: 'rotativo', name: 'Turno Tarde (rotativo)', st: 'activo', days: [1, 2, 3, 4, 5], bk: 30, entry: '14:00', exit: '22:00', tolE: 5, tolS: 10, heT: 30, periodStart: '2026-06-01', periodEnd: '2026-06-30' },
  { id: 3, kind: 'fijo', name: 'Turno Noche', st: 'activo', days: [1, 2, 3, 4, 5], bk: 10, entry: '19:00', exit: '23:50', tolE: 5, tolS: 5, heT: 30 },
  { id: 4, kind: 'flexible', name: 'Jornada Flexible', st: 'activo', days: [1, 2, 3, 4, 5], bk: 30, windowStart: '07:00', windowEnd: '20:00', hours: 8 },
]

export const FICHADAS: Fichada[] = [
  { id: 1, eId: 2, type: 'entrada', dt: '2026-06-01 08:02', org: 'biométrico' }, { id: 2, eId: 2, type: 'salida', dt: '2026-06-01 16:04', org: 'biométrico' },
  { id: 3, eId: 2, type: 'entrada', dt: '2026-06-02 08:11', org: 'biométrico' }, { id: 4, eId: 2, type: 'salida', dt: '2026-06-02 16:00', org: 'biométrico' },
  { id: 5, eId: 2, type: 'entrada', dt: '2026-06-03 08:00', org: 'biométrico' }, { id: 6, eId: 2, type: 'salida', dt: '2026-06-03 17:15', org: 'biométrico' },
  { id: 7, eId: 2, type: 'entrada', dt: '2026-06-04 08:05', org: 'biométrico' }, { id: 8, eId: 2, type: 'salida', dt: '2026-06-04 16:00', org: 'biométrico' },
  { id: 9, eId: 2, type: 'entrada', dt: '2026-06-05 08:00', org: 'biométrico' }, { id: 10, eId: 2, type: 'salida', dt: '2026-06-05 16:00', org: 'biométrico' },
  { id: 11, eId: 2, type: 'entrada', dt: '2026-06-08 08:00', org: 'biométrico' }, { id: 12, eId: 2, type: 'salida', dt: '2026-06-08 16:00', org: 'biométrico' },
  { id: 13, eId: 2, type: 'entrada', dt: '2026-06-09 08:22', org: 'biométrico' }, { id: 14, eId: 2, type: 'salida', dt: '2026-06-09 16:00', org: 'biométrico' },
  { id: 15, eId: 2, type: 'entrada', dt: '2026-06-10 08:00', org: 'biométrico' }, { id: 16, eId: 2, type: 'salida', dt: '2026-06-10 16:00', org: 'biométrico' },
  { id: 17, eId: 2, type: 'entrada', dt: '2026-06-11 08:00', org: 'biométrico' }, { id: 18, eId: 2, type: 'salida', dt: '2026-06-11 16:00', org: 'biométrico' },
  { id: 19, eId: 2, type: 'entrada', dt: '2026-06-12 08:00', org: 'biométrico' }, { id: 20, eId: 2, type: 'salida', dt: '2026-06-12 16:00', org: 'biométrico' },
  { id: 21, eId: 2, type: 'entrada', dt: '2026-06-15 08:00', org: 'biométrico' }, { id: 22, eId: 2, type: 'salida', dt: '2026-06-15 16:00', org: 'biométrico' },
  { id: 23, eId: 2, type: 'entrada', dt: '2026-06-16 08:00', org: 'biométrico' }, { id: 24, eId: 2, type: 'salida', dt: '2026-06-16 16:00', org: 'biométrico' },
  { id: 25, eId: 2, type: 'entrada', dt: '2026-06-17 08:00', org: 'biométrico' }, { id: 26, eId: 2, type: 'salida', dt: '2026-06-17 16:00', org: 'biométrico' },
  { id: 27, eId: 2, type: 'entrada', dt: '2026-06-18 08:05', org: 'biométrico' },
  { id: 30, eId: 3, type: 'entrada', dt: '2026-06-01 14:00', org: 'biométrico' }, { id: 31, eId: 3, type: 'salida', dt: '2026-06-01 22:05', org: 'biométrico' },
  { id: 32, eId: 3, type: 'entrada', dt: '2026-06-02 14:18', org: 'biométrico' }, { id: 33, eId: 3, type: 'salida', dt: '2026-06-02 22:00', org: 'biométrico' },
  { id: 34, eId: 3, type: 'entrada', dt: '2026-06-03 14:00', org: 'biométrico' }, { id: 35, eId: 3, type: 'salida', dt: '2026-06-03 22:00', org: 'biométrico' },
  { id: 36, eId: 3, type: 'entrada', dt: '2026-06-04 14:00', org: 'biométrico' }, { id: 37, eId: 3, type: 'salida', dt: '2026-06-04 22:00', org: 'biométrico' },
  { id: 38, eId: 3, type: 'entrada', dt: '2026-06-05 14:00', org: 'biométrico' }, { id: 39, eId: 3, type: 'salida', dt: '2026-06-05 22:00', org: 'biométrico' },
  { id: 40, eId: 3, type: 'entrada', dt: '2026-06-08 14:00', org: 'biométrico' }, { id: 41, eId: 3, type: 'salida', dt: '2026-06-08 22:00', org: 'biométrico' },
  { id: 42, eId: 3, type: 'entrada', dt: '2026-06-09 14:00', org: 'biométrico' }, { id: 43, eId: 3, type: 'salida', dt: '2026-06-09 22:00', org: 'biométrico' },
  { id: 44, eId: 3, type: 'entrada', dt: '2026-06-11 14:00', org: 'biométrico' }, { id: 45, eId: 3, type: 'salida', dt: '2026-06-11 22:00', org: 'biométrico' },
  { id: 46, eId: 3, type: 'entrada', dt: '2026-06-12 14:00', org: 'biométrico' }, { id: 47, eId: 3, type: 'salida', dt: '2026-06-12 22:45', org: 'biométrico' },
  { id: 48, eId: 3, type: 'entrada', dt: '2026-06-15 14:00', org: 'biométrico' }, { id: 49, eId: 3, type: 'salida', dt: '2026-06-15 22:00', org: 'biométrico' },
  { id: 50, eId: 3, type: 'entrada', dt: '2026-06-16 14:00', org: 'biométrico' }, { id: 51, eId: 3, type: 'salida', dt: '2026-06-16 22:00', org: 'biométrico' },
  { id: 52, eId: 3, type: 'entrada', dt: '2026-06-17 14:00', org: 'biométrico' }, { id: 53, eId: 3, type: 'salida', dt: '2026-06-17 22:00', org: 'biométrico' },
  { id: 54, eId: 3, type: 'entrada', dt: '2026-06-18 14:00', org: 'biométrico' },
  { id: 60, eId: 4, type: 'entrada', dt: '2026-06-01 09:00', org: 'biométrico' }, { id: 61, eId: 4, type: 'salida', dt: '2026-06-01 18:00', org: 'biométrico' },
  { id: 62, eId: 4, type: 'entrada', dt: '2026-06-02 09:08', org: 'biométrico' }, { id: 63, eId: 4, type: 'salida', dt: '2026-06-02 18:00', org: 'biométrico' },
  { id: 64, eId: 4, type: 'entrada', dt: '2026-06-03 09:00', org: 'biométrico' }, { id: 65, eId: 4, type: 'salida', dt: '2026-06-03 18:00', org: 'biométrico' },
  { id: 66, eId: 4, type: 'entrada', dt: '2026-06-04 09:00', org: 'biométrico' }, { id: 67, eId: 4, type: 'salida', dt: '2026-06-04 18:00', org: 'biométrico' },
  { id: 68, eId: 4, type: 'entrada', dt: '2026-06-05 09:00', org: 'biométrico' }, { id: 69, eId: 4, type: 'salida', dt: '2026-06-05 18:00', org: 'biométrico' },
  { id: 70, eId: 4, type: 'entrada', dt: '2026-06-08 09:00', org: 'biométrico' }, { id: 71, eId: 4, type: 'salida', dt: '2026-06-08 18:00', org: 'biométrico' },
  { id: 72, eId: 4, type: 'entrada', dt: '2026-06-09 09:00', org: 'biométrico' }, { id: 73, eId: 4, type: 'salida', dt: '2026-06-09 18:00', org: 'biométrico' },
  { id: 74, eId: 4, type: 'entrada', dt: '2026-06-12 09:00', org: 'biométrico' }, { id: 75, eId: 4, type: 'salida', dt: '2026-06-12 18:00', org: 'biométrico' },
  { id: 76, eId: 4, type: 'entrada', dt: '2026-06-15 09:00', org: 'biométrico' }, { id: 77, eId: 4, type: 'salida', dt: '2026-06-15 18:00', org: 'biométrico' },
  { id: 78, eId: 4, type: 'entrada', dt: '2026-06-16 09:00', org: 'biométrico' }, { id: 79, eId: 4, type: 'salida', dt: '2026-06-16 18:00', org: 'biométrico' },
  { id: 80, eId: 4, type: 'entrada', dt: '2026-06-17 09:30', org: 'biométrico' }, { id: 81, eId: 4, type: 'salida', dt: '2026-06-17 18:00', org: 'biométrico' },
  { id: 82, eId: 4, type: 'entrada', dt: '2026-06-18 09:00', org: 'biométrico' }, { id: 83, eId: 4, type: 'salida', dt: '2026-06-18 18:00', org: 'biométrico' },
  { id: 90, eId: 5, type: 'entrada', dt: '2026-06-01 08:00', org: 'biométrico' }, { id: 91, eId: 5, type: 'salida', dt: '2026-06-01 16:00', org: 'biométrico' },
  { id: 92, eId: 5, type: 'entrada', dt: '2026-06-02 08:00', org: 'biométrico' }, { id: 93, eId: 5, type: 'salida', dt: '2026-06-02 16:00', org: 'biométrico' },
  { id: 94, eId: 5, type: 'entrada', dt: '2026-06-03 08:00', org: 'biométrico' }, { id: 95, eId: 5, type: 'salida', dt: '2026-06-03 16:00', org: 'biométrico' },
  { id: 96, eId: 5, type: 'entrada', dt: '2026-06-04 08:00', org: 'biométrico' }, { id: 97, eId: 5, type: 'salida', dt: '2026-06-04 16:00', org: 'biométrico' },
  { id: 98, eId: 5, type: 'entrada', dt: '2026-06-08 08:00', org: 'biométrico' }, { id: 99, eId: 5, type: 'salida', dt: '2026-06-08 16:00', org: 'biométrico' },
  { id: 100, eId: 5, type: 'entrada', dt: '2026-06-09 08:00', org: 'biométrico' }, { id: 101, eId: 5, type: 'salida', dt: '2026-06-09 16:00', org: 'biométrico' },
  { id: 102, eId: 5, type: 'entrada', dt: '2026-06-10 08:00', org: 'biométrico' }, { id: 103, eId: 5, type: 'salida', dt: '2026-06-10 16:00', org: 'biométrico' },
  { id: 104, eId: 5, type: 'entrada', dt: '2026-06-11 08:00', org: 'biométrico' }, { id: 105, eId: 5, type: 'salida', dt: '2026-06-11 16:00', org: 'biométrico' },
  { id: 106, eId: 5, type: 'entrada', dt: '2026-06-12 08:00', org: 'biométrico' }, { id: 107, eId: 5, type: 'salida', dt: '2026-06-12 16:00', org: 'biométrico' },
  { id: 108, eId: 5, type: 'entrada', dt: '2026-06-15 08:00', org: 'biométrico' }, { id: 109, eId: 5, type: 'salida', dt: '2026-06-15 16:00', org: 'biométrico' },
  { id: 110, eId: 5, type: 'entrada', dt: '2026-06-16 08:00', org: 'biométrico' }, { id: 111, eId: 5, type: 'salida', dt: '2026-06-16 16:00', org: 'biométrico' },
  { id: 112, eId: 5, type: 'entrada', dt: '2026-06-17 08:00', org: 'biométrico' }, { id: 113, eId: 5, type: 'salida', dt: '2026-06-17 16:00', org: 'biométrico' },
  { id: 114, eId: 5, type: 'entrada', dt: '2026-06-18 08:00', org: 'biométrico' }, { id: 115, eId: 5, type: 'salida', dt: '2026-06-18 16:00', org: 'biométrico' },
  { id: 120, eId: 6, type: 'entrada', dt: '2026-06-01 09:02', org: 'biométrico' }, { id: 121, eId: 6, type: 'salida', dt: '2026-06-01 18:05', org: 'biométrico' },
  { id: 122, eId: 6, type: 'entrada', dt: '2026-06-02 09:09', org: 'biométrico' }, { id: 123, eId: 6, type: 'salida', dt: '2026-06-02 18:00', org: 'biométrico' },
  { id: 124, eId: 6, type: 'entrada', dt: '2026-06-03 09:00', org: 'biométrico' }, { id: 125, eId: 6, type: 'salida', dt: '2026-06-03 18:28', org: 'biométrico' },
  { id: 126, eId: 6, type: 'entrada', dt: '2026-06-04 09:07', org: 'biométrico' }, { id: 127, eId: 6, type: 'salida', dt: '2026-06-04 18:00', org: 'biométrico' },
  { id: 128, eId: 6, type: 'entrada', dt: '2026-06-05 09:00', org: 'biométrico' }, { id: 129, eId: 6, type: 'salida', dt: '2026-06-05 19:15', org: 'biométrico' },
  { id: 130, eId: 6, type: 'entrada', dt: '2026-06-08 09:00', org: 'biométrico' }, { id: 131, eId: 6, type: 'salida', dt: '2026-06-08 18:00', org: 'biométrico' },
  { id: 132, eId: 6, type: 'entrada', dt: '2026-06-09 09:25', org: 'biométrico' }, { id: 133, eId: 6, type: 'salida', dt: '2026-06-09 18:00', org: 'biométrico' },
  { id: 134, eId: 6, type: 'entrada', dt: '2026-06-11 09:00', org: 'biométrico' }, { id: 135, eId: 6, type: 'salida', dt: '2026-06-11 18:00', org: 'biométrico' },
  { id: 136, eId: 6, type: 'entrada', dt: '2026-06-12 09:00', org: 'biométrico' }, { id: 137, eId: 6, type: 'salida', dt: '2026-06-12 18:00', org: 'biométrico' },
  { id: 138, eId: 6, type: 'entrada', dt: '2026-06-15 09:00', org: 'biométrico' }, { id: 139, eId: 6, type: 'salida', dt: '2026-06-15 18:14', org: 'biométrico' },
  { id: 140, eId: 6, type: 'entrada', dt: '2026-06-16 09:10', org: 'biométrico' }, { id: 141, eId: 6, type: 'salida', dt: '2026-06-16 18:00', org: 'biométrico' },
  { id: 142, eId: 6, type: 'entrada', dt: '2026-06-17 09:00', org: 'biométrico' }, { id: 143, eId: 6, type: 'salida', dt: '2026-06-17 18:00', org: 'biométrico' },
]

export const NOVEDADES: Novedad[] = [
  { id: 1, eId: 2, type: 'Tardanza', d1: '2026-06-02', d2: null, qty: '6 min', org: 'automática', st: 'aprobada', obs: 'Detectada al momento del fichaje.', resBy: 'Rodríguez, María', resAt: '2026-06-03' },
  { id: 2, eId: 2, type: 'Horas extra 50%', d1: '2026-06-03', d2: null, qty: '75 min', org: 'automática', st: 'aprobada', obs: 'Autorizada previamente.', resBy: 'Rodríguez, María', resAt: '2026-06-04' },
  { id: 3, eId: 2, type: 'Tardanza', d1: '2026-06-09', d2: null, qty: '17 min', org: 'automática', st: 'pendiente', obs: null, resBy: null, resAt: null },
  { id: 4, eId: 3, type: 'Tardanza', d1: '2026-06-02', d2: null, qty: '13 min', org: 'automática', st: 'aprobada', obs: null, resBy: 'Rodríguez, María', resAt: '2026-06-03' },
  { id: 5, eId: 3, type: 'Ausencia injustificada', d1: '2026-06-10', d2: null, qty: '1 día', org: 'manual', st: 'pendiente', obs: 'No comunicó ausencia. Se intenta contactar.', resBy: null, resAt: null },
  { id: 6, eId: 3, type: 'Horas extra 50%', d1: '2026-06-12', d2: null, qty: '45 min', org: 'automática', st: 'pendiente', obs: null, resBy: null, resAt: null },
  { id: 7, eId: 4, type: 'Licencia médica', d1: '2026-06-10', d2: '2026-06-11', qty: '2 días', org: 'manual', st: 'aprobada', obs: 'Presentó certificado médico. Reposo indicado.', resBy: 'Rodríguez, María', resAt: '2026-06-12' },
  { id: 8, eId: 4, type: 'Tardanza', d1: '2026-06-17', d2: null, qty: '20 min', org: 'automática', st: 'pendiente', obs: null, resBy: null, resAt: null },
  { id: 9, eId: 5, type: 'Ausencia injustificada', d1: '2026-06-05', d2: null, qty: '1 día', org: 'manual', st: 'rechazada', obs: 'No justificó la ausencia.', resBy: 'Rodríguez, María', resAt: '2026-06-09' },
  { id: 10, eId: 6, type: 'Horas extra 50%', d1: '2026-06-05', d2: null, qty: '75 min', org: 'automática', st: 'aprobada', obs: 'Cierre de proyecto. Autorizada.', resBy: 'Rodríguez, María', resAt: '2026-06-08' },
  { id: 11, eId: 6, type: 'Tardanza', d1: '2026-06-09', d2: null, qty: '15 min', org: 'automática', st: 'pendiente', obs: null, resBy: null, resAt: null },
  { id: 12, eId: 6, type: 'Ausencia injustificada', d1: '2026-06-10', d2: null, qty: '1 día', org: 'manual', st: 'pendiente', obs: 'Empleado no comunicó la ausencia.', resBy: null, resAt: null },
]

export const SOLICITUDES: Solicitud[] = [
  { id: 1, eId: 6, type: 'Justificativo de ausencia', sentAt: '2026-06-10', period: '10/06/2026', st: 'pendiente', resp: null },
  { id: 2, eId: 6, type: 'Solicitud de licencia', sentAt: '2026-05-12', period: '15/05/2026 – 16/05/2026', st: 'aprobada', resp: 'Licencia aprobada. Recordá traer el certificado médico al reincorporarte.' },
]

// Mayo es histórico (cerrado, sin fichadas de mayo en el seed para recomputar):
// se mantiene estático. Junio ahora lo calcula el motor (src/lib/liquidacion.ts).
export const MAY_RES: ResRow[] = [
  { eId: 2, dt: 22, aus: '0', tMin: 12, he50: 60, he100: 0, sAnt: 0, exD: 0, jInc: 0 },
  { eId: 3, dt: 21, aus: '1 inj.', tMin: 8, he50: 45, he100: 0, sAnt: 0, exD: 0, jInc: 0 },
  { eId: 4, dt: 20, aus: '2 lic.', tMin: 0, he50: 0, he100: 0, sAnt: 0, exD: 0, jInc: 0 },
  { eId: 5, dt: 21, aus: '1 inj.', tMin: 0, he50: 0, he100: 0, sAnt: 0, exD: 0, jInc: 0 },
  { eId: 6, dt: 22, aus: '0', tMin: 5, he50: 0, he100: 0, sAnt: 0, exD: 0, jInc: 0 },
]
