# Fichaje del empleado: flujo con descanso (almuerzo)

Se agregó el evento de **descanso/almuerzo** al fichaje del empleado, dándole
uso al campo `tiempo_descanso` (`bk`) del horario que antes no se usaba.
Alineado con las reglas del motor del TP ("Jornada sin descanso" y "Exceso de
tiempo de descanso/pausa").

## Contexto: qué era "Registrar pasada"

- El botón principal fichaba con la **hora actual** del reloj.
- **"Registrar pasada"** abre un mini-formulario para fichar con una **hora
  manual** (caso típico: te olvidaste de fichar y lo cargás después). No es un
  duplicado del botón principal.
- El botón principal **ya se transformaba** según el estado (entrada → salida);
  ahora ese flujo incluye el descanso.

## Nuevo flujo (botón que progresa por estado)

| Estado | Botones |
|--------|---------|
| `sin-entrada` | **Fichar entrada** · Registrar pasada |
| `en-jornada` | **Fichar salida** · Iniciar almuerzo · Registrar pasada |
| `en-descanso` | **Volver de almuerzo** |
| `jornada-completa` | (deshabilitado) |

## Modelo de datos — `src/types.ts`

- `FichType` pasa de `'entrada' | 'salida'` a
  `'entrada' | 'salida' | 'inicio-descanso' | 'fin-descanso'`.

## Estado y lógica — `src/store/DataContext.tsx`

- `EmpFichajeState` agrega `'en-descanso'`.
- Nuevo estado interno: `eBreakStart` (hora de inicio del descanso, expuesto al
  UI) y `eBreakTaken` (si hubo pausa en el día).
- `fichar(type, hora)` ahora ramifica por los 4 tipos:
  - `inicio-descanso` → guarda `eBreakStart`, pasa a `en-descanso`.
  - `fin-descanso` → vuelve a `en-jornada`; si la pausa superó `bk` genera la
    novedad **Exceso de descanso**.
  - `salida` → si el horario exige descanso (`bk > 0`) y no hubo pausa, genera
    **Jornada sin descanso** (además del cálculo de horas extra / jornada
    flexible ya existente).
- `FichajeResult` agrega `excesoDescanso?` y `sinDescanso?` para los toasts.

## Motor de reglas — `src/lib/rules.ts`

- `detectExcesoDescanso(inicio, fin, shift)`: minutos que la pausa supera el
  `bk` del horario (0 si está dentro de lo permitido o si `bk` es 0).

## UI — `src/pages/emp/Inicio.tsx`

- Botones por estado (tabla de arriba) + mensaje de estado para `en-descanso`
  ("En descanso desde las HH:mm").
- Toasts específicos para inicio/fin de descanso, exceso de descanso y jornada
  sin descanso.
- El formulario "Registrar pasada" permite cargar también inicio/fin de
  descanso con hora manual.

## Otros — `src/lib/format.ts` y admin

- `fichTypeMeta(type)`: etiqueta (con ícono) y color de badge por tipo de
  fichada.
- `src/pages/admin/Fichadas.tsx`: la tabla usa `fichTypeMeta`, así los descansos
  ya no se mal-etiquetan como "Salida".

## Pendientes conocidos

- "Exceso de descanso" y "Jornada sin descanso" son tipos de novedad nuevos, aún
  sin entrada en `novTip` / `novTipoMeta` (sin tooltip ni hint en las pantallas
  de novedades).
- El estado de fichaje vive en memoria (`DataContext`): al recargar vuelve al
  estado inicial sembrado.
