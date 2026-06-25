# Consolidación: del motor de reglas a la preliquidación

> Estado actual: **no implementado**. Este documento describe el eslabón que
> falta para que los eventos del motor (tardanza, salida anticipada, exceso de
> descanso, horas extra, ausencias, licencias) se traduzcan en los números de la
> preliquidación que recibe el contador.

## El problema hoy

El motor genera **novedades** y las guarda en `DataContext`, pero la tabla de
preliquidación del cierre **no las usa para calcular**:

- `src/pages/admin/Cierre.tsx` arma los totales por empleado (días trabajados,
  ausencias, tardanza en min, HE 50/100) leyendo `JUN_RES` / `MAY_RES`, que son
  **arrays estáticos** de `src/data/seed.ts` (números escritos a mano).
- Las novedades sólo se listan como detalle informativo al lado de esos totales.
- Aprobar/rechazar (`src/hooks/useNovActions.ts`) sólo cambia `novedad.st`;
  **nada recalcula** los totales.
- Por lo mismo, **justificar una tardanza no recontempla nada**: el resumen no
  se deriva de las novedades, así que el estado/justificación no impacta.

El eslabón faltante es la **consolidación**: agregar las novedades aprobadas +
las fichadas del período → filas `ResRow` por empleado.

## ¿Front o backend?

En el sistema real probablemente vive en el backend (.NET, servicio de dominio
"motor de reglas"). Para que el **demo se sienta real**, conviene implementarla
en el front, dentro de `DataContext`, computando `ResRow` en vez de leerlo del
seed. La lógica de negocio es la misma; sólo cambia dónde corre.

## Diseño propuesto

Una función pura de consolidación, parametrizada por empresa (sin hardcodear
umbrales, como pide el TP):

```
consolidarPeriodo(empleadoId, periodo, { fichadas, novedades, horario, reglas })
  → ResRow
```

Pasos:

1. **Días trabajados**: contar días del período con fichada de entrada (desde
   `fichadas`).
2. **Recorrer novedades aprobadas** del empleado en el período y acumular por
   tipo según la tabla de efectos de abajo. Las `pendiente` / `rechazada` se
   excluyen (decisión: ¿las pendientes bloquean el cierre o se ignoran?).
3. **Clasificar ausencias** en justificadas vs injustificadas según el tipo de
   novedad asociada.
4. Devolver la fila consolidada (snapshot inmutable al cerrar).

## Tabla "novedad → efecto en liquidación" (a validar)

Cada fila es una **decisión de negocio** que hay que confirmar antes de codificar:

| Novedad | Efecto propuesto en el resumen | Decisión pendiente |
|---------|-------------------------------|--------------------|
| Tardanza (aprobada, sin justificar) | Suma minutos a `tMin` | ¿Se descuenta del sueldo o sólo se informa? |
| Tardanza (justificada) | **No** suma a `tMin` (o va a columna aparte) | ¿Justificada = se perdona del todo? |
| Salida anticipada | Resta minutos de jornada / columna propia | ¿Resta del computable o sólo se documenta? |
| Horas extra 50% | Suma a `he50` | — |
| Horas extra 100% | Suma a `he100` | — |
| Exceso de descanso | Minutos a descontar o aviso | ¿Descuenta o sólo alerta al admin? |
| Jornada sin descanso | Incidente informativo | ¿Impacta liquidación? Probablemente no. |
| Ausencia injustificada | Cuenta en `aus` como injustificada | Afecta presentismo/descuento. |
| Ausencia / licencia justificada | Cuenta en `aus` como justificada | No descuenta; tratamiento según tipo (art. 208 LCT, etc.). |
| Jornada incompleta (flexible) | Minutos faltantes / columna propia | ¿Descuenta proporcional? |

## Cómo se conecta con "Generar resumen"

`generarResumen` (hoy un stub que sólo pasa a borrador) pasaría a **calcular**
las filas con `consolidarPeriodo` para todos los empleados activos del período.
Al cerrar, ese resultado se congela como snapshot (espeja `CierreMensual`).
"Regenerar" recomputa mientras el período esté en borrador.

## Resumen de qué falta

1. Definir/validar la tabla de efectos de arriba (reglas de negocio).
2. Implementar `consolidarPeriodo` (función pura, parametrizable).
3. Conectar `generarResumen` para que use la consolidación en vez de `JUN_RES`.
4. Hacer que el cálculo respete `novedad.st` (sólo aprobadas) y la justificación.
5. (Opcional) Persistir el snapshot del cierre.
