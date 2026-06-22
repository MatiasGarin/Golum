# GestRRHH — React

Sistema de gestión de asistencia, fichadas y novedades laborales. Migración a React
del prototipo original `mockup.html`, manteniendo funcionalidad y diseño.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** (paleta mapeada a variables CSS para soportar tema claro/oscuro)
- **Chart.js** / **react-chartjs-2** (gráficos del dashboard)
- **React Router** (navegación admin / empleado)
- Datos **mock en memoria** (sin backend) — ver `src/data/seed.ts`

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción (typecheck + bundle en dist/)
npm run preview  # previsualizar el build
```

## Uso (modo demo)

En la pantalla de login elegí un rol — no requiere contraseña:

- **Administrador** (María Rodríguez): dashboard, usuarios, horarios, fichadas,
  novedades y cierre mensual.
- **Empleado** (Juan Pérez): inicio con fichaje, asistencia, novedades y solicitudes.

Atajo de desarrollo: `/login?as=admin` o `/login?as=empleado` ingresan
automáticamente (solo activo con `npm run dev`).

## Estructura

```
src/
  data/seed.ts        Datos mock (empleados, turnos, fichadas, novedades, etc.)
  types.ts            Tipos del dominio
  lib/                rules (motor de tardanza/horas extra), format, csv
  store/              Contextos: Data (estado global), Theme, Toast, Confirm
  components/         ui/ (Badge, Avatar, Modal, MetricCard, icons),
                      layout/ (Sidebar, AppShell), charts/
  layouts/            AdminLayout, EmpLayout (guardas por rol)
  pages/              admin/* y emp/*
```

## Notas

- La fecha "de hoy" está fijada a `2026-06-18` (constante `TODAY`) para que los datos
  de muestra sean coherentes; el reloj del panel de fichaje usa la hora real.
- El motor de reglas (`src/lib/rules.ts`) genera novedades automáticas de Tardanza y
  Horas Extra al registrar fichadas, igual que el prototipo original.
