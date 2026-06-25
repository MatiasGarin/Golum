# Horarios: 3 tipos (fijo, rotativo, flexible)

Se incorporaron los tres tipos de horario del esquema de datos (polimorfismo de
tablas: `Horario` base + `HorarioFijo` / `HorarioRotativo` / `HorarioFlexible`)
al modelo, la pantalla de configuración y el motor de reglas.

## Modelo de datos — `src/types.ts`

`Shift` pasa a ser una **unión discriminada** por `kind`:

| Tipo | Campos propios |
|------|----------------|
| Base (todos) | `name`, `st` (estado), `days`, `bk` (tiempo de descanso) |
| `fijo` | `entry`, `exit`, `tolE`, `tolS`, `heT` |
| `rotativo` | lo de fijo + `periodStart`, `periodEnd` (vigencia) |
| `flexible` | `windowStart`, `windowEnd`, `hours` (horas a cumplir) — sin franja fija |

Helper `hasFixedHours(s)` para distinguir fijo/rotativo de flexible.

## Pantalla de Horarios — `src/pages/admin/Horarios.tsx`

- Selector de tipo al crear un horario nuevo.
- Editor que **renderiza campos según el tipo**:
  - fijo/rotativo → entrada/salida + tolerancias + timeline;
  - rotativo → además el rango de fechas de vigencia;
  - flexible → ventana horaria + horas a cumplir (sin tolerancia de entrada).
- Lista con badge de tipo y resumen adecuado por tipo.

## Motor de reglas — `src/lib/rules.ts`

- `detectTardanza` / `detectHorasExtra`: conscientes del tipo (flexible nunca
  genera tardanza).
- `evalFlexible(entrada, salida, shift)`: horas trabajadas dentro de la ventana
  → **jornada incompleta** (faltante) o **horas extra** (excedente).
- `isWithinPeriod(fecha, shift)`: el rotativo sólo se interpreta dentro de su
  período de vigencia.

## Lógica del empleado — `src/store/DataContext.tsx`

- Fichaje (self-service y carga manual del admin) ramifica el cálculo de
  novedades por tipo de horario.
- `addShift(kind)` crea defaults por tipo; `saveShift(shift)` guarda el horario
  completo.

## Otros

- `src/lib/format.ts`: helpers `shiftKindLabel` y `shiftSummary`.
- `src/pages/admin/Usuarios.tsx`: usa `shiftSummary` (la tabla/selector ya no
  asumen entrada/salida fija).
- `src/data/seed.ts`: turnos convertidos a los nuevos tipos + "Jornada Flexible"
  con un empleado asignado para poblar la demo.

## Salida anticipada (agregado al motor)

Se incorporó la detección de **salida anticipada**, que no existía (sólo había
tardanza, horas extra y descanso).

- `detectSalidaAnticipada(exitTime, shift)` en `src/lib/rules.ts`: minutos de
  adelanto sobre `salida − tolerancia de salida`. Sólo aplica a fijo/rotativo
  (el flexible no tiene salida fija).
- En `src/store/DataContext.tsx`, al fichar salida temprano se genera la novedad
  automática **"Salida anticipada"**; `FichajeResult` agrega `salidaAnticipada`.
- `src/pages/emp/Inicio.tsx` muestra el toast de aviso correspondiente.

## Turno de prueba y encabezado dinámico

- `src/data/seed.ts`: el turno id 3 (asignado a Juan, el empleado de prueba) se
  reconfiguró como "Turno Prueba (Noche)": entrada `19:00`, salida `23:50`,
  tolerancias en `0` y descanso `10` min. Sirve para probar tardanza exacta,
  exceso de descanso y salida anticipada.
- `src/pages/emp/Inicio.tsx`: el encabezado del empleado ahora muestra el turno
  de forma **dinámica** (nombre + `shiftSummary`) en vez de un texto fijo.

## Pendientes conocidos

- "Jornada incompleta", "Exceso de descanso", "Jornada sin descanso" y "Salida
  anticipada" son tipos de novedad nuevos, aún no listados en `NOVEDAD_TYPES`
  (sin tooltip ni opción en carga manual).
- El modelo mantiene tolerancias separadas (entrada/salida/umbral HE); el
  esquema de BD define un único campo `tolerancia` — diferencia a conciliar con
  el backend.
- El fichaje usa la hora real del reloj; para probar los horarios nocturnos del
  turno de prueba hay que hacerlo en ese horario (o agregar un input de hora
  manual de testeo).
