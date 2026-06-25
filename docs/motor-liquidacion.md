# Consolidación: del motor de reglas a la preliquidación

> Estado: **implementado** en `src/lib/liquidacion.ts`. El cierre de Junio se
> consolida en vivo desde fichadas + novedades; Mayo queda como histórico estático.

## Modelo de aprobación (actual)

La clave del diseño es **dónde vive la aprobación**:

- Los **desvíos automáticos** (Tardanza, Salida anticipada, Exceso de descanso,
  Jornada incompleta) los mide el reloj: se registran **en firme**
  (`Novedad.st = 'registrada'`) y **cuentan siempre** en el reporte. No necesitan
  aprobación porque son hechos, no decisiones.
- Lo que se aprueba es la **justificación** de un desvío
  (`Novedad.justSt: 'pendiente' | 'aprobada' | 'rechazada'`, `null` = sin justificar).
  Una justificación **aprobada excluye** ese desvío de las faltas injustificadas /
  minutos del reporte. El empleado la pide desde *Solicitudes* (queda `pendiente`);
  el admin la resuelve en *Novedades*.
- Las **Horas Extra** son la excepción: requieren **autorización** del admin para
  pagarse. Usan `st` como gate (`pendiente → aprobada/rechazada`) y sólo computan
  si `st === 'aprobada'`.

La clasificación por tipo vive en `src/lib/novedad.ts`
(`requiereAutorizacion`, `esJustificable`, `esLicencia`, `pendienteDeResolucion`).

## Función de consolidación

```
consolidarPeriodo(empleadoId, periodo, { fichadas, novedades }) → ResRow
```

Pasos:

1. **Días trabajados**: días distintos del período con fichada de entrada.
2. **Recorrer las novedades** del empleado en el período y acumular por tipo según
   la tabla de abajo.
3. Clasificar ausencias en justificadas (lic) vs injustificadas (inj) según `justSt`.

## Tabla "novedad → efecto en liquidación"

| Novedad | Condición | Efecto en el resumen |
|---------|-----------|----------------------|
| Tardanza | `justSt !== 'aprobada'` | Suma minutos a `tMin` (si justificada, se excluye) |
| Salida anticipada | `justSt !== 'aprobada'` | Suma minutos a `sAnt` |
| Exceso de descanso | `justSt !== 'aprobada'` | Suma minutos a `exD` |
| Jornada incompleta | `justSt !== 'aprobada'` | Suma minutos a `jInc` |
| Horas extra 50% / 100% | `st === 'aprobada'` (autorizada) | Suma a `he50` / `he100` |
| Ausencia | `justSt === 'aprobada'` → lic; si no → inj | Cuenta en `aus` |
| Licencia* / Vacaciones / Permiso / Suspensión | `justSt === 'aprobada'` → lic | Cuenta en `aus` (cargadas ya justificadas) |
| Jornada sin descanso | — | Informativo, sin impacto |

## Conexión con "Generar resumen"

`Cierre.tsx` calcula las filas con `consolidarTodos` para todos los empleados
activos del período (memoizado sobre fichadas + novedades). Al cerrar, el período
pasa a `cerrado` (en el demo el snapshot es el cálculo en vivo).
