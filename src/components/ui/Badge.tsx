import type { ReactNode } from 'react'
import type { Role, NovStatus, NovOrigen, UserStatus, FichOrigen, JustStatus, Novedad } from '../../types'
import { requiereAutorizacion, esJustificable } from '../../lib/novedad'

type BadgeColor = 'gn' | 'rd' | 'am' | 'bl' | 'pu' | 'gy'

export function Badge({ color, children, tip, className = '' }: { color: BadgeColor; children: ReactNode; tip?: string; className?: string }) {
  return (
    <span className={`bg bg-${color} ${className}`} data-tip={tip}>
      {children}
    </span>
  )
}

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<string, [BadgeColor, string]> = {
    admin: ['bl', 'Admin'],
    empleado: ['gy', 'Empleado'],
    contador: ['pu', 'Contador'],
  }
  const [c, l] = map[role] ?? (['gy', role] as [BadgeColor, string])
  return <Badge color={c}>{l}</Badge>
}

export function StatusBadge({ st }: { st: NovStatus | UserStatus }) {
  const map: Record<string, [BadgeColor, string]> = {
    registrada: ['bl', 'Registrada'],
    pendiente: ['pu', 'Pendiente'],
    aprobada: ['gn', 'Aprobada'],
    rechazada: ['rd', 'Rechazada'],
    activo: ['gn', 'Activo'],
    inactivo: ['rd', 'Inactivo'],
  }
  const [c, l] = map[st] ?? (['gy', st] as [BadgeColor, string])
  return <Badge color={c}>{l}</Badge>
}

/** Estado de autorización de una Hora Extra (pendiente / autorizada / rechazada). */
export function AutBadge({ st }: { st: NovStatus }) {
  const map: Record<string, [BadgeColor, string, string]> = {
    pendiente: ['pu', 'A autorizar', 'Hora extra pendiente de autorización: aún no se computa ni paga.'],
    aprobada: ['gn', 'Autorizada', 'Hora extra autorizada: se computa y paga en el reporte.'],
    rechazada: ['rd', 'No autorizada', 'Hora extra rechazada: no se paga.'],
  }
  const [c, l, tip] = map[st] ?? (['gy', st, ''] as [BadgeColor, string, string])
  return <Badge color={c} tip={tip}>{l}</Badge>
}

/** Estado de la justificación de un desvío. `null` = sin justificar. */
export function JustBadge({ justSt }: { justSt: JustStatus | null | undefined }) {
  const map: Record<string, [BadgeColor, string, string]> = {
    pendiente: ['pu', 'Justif. pendiente', 'El empleado pidió justificar; falta resolver. El desvío sigue contando.'],
    aprobada: ['gn', 'Justificada', 'Justificación aprobada: excluida de las faltas/minutos del reporte.'],
    rechazada: ['rd', 'Justif. rechazada', 'Justificación denegada: el desvío cuenta en el reporte.'],
  }
  if (!justSt) return <Badge color="gy" tip="Sin justificación: el desvío cuenta en el reporte.">Sin justificar</Badge>
  const [c, l, tip] = map[justSt] ?? (['gy', justSt, ''] as [BadgeColor, string, string])
  return <Badge color={c} tip={tip}>{l}</Badge>
}

/**
 * Badge de estado de una novedad, eligiendo la semántica correcta:
 *  - Horas extra → estado de autorización.
 *  - Desvíos justificables → estado de justificación.
 *  - Resto (informativos / licencias ya justificadas) → estado simple.
 */
export function NovStatusBadge({ n }: { n: Novedad }) {
  if (requiereAutorizacion(n.type)) return <AutBadge st={n.st} />
  if (esJustificable(n.type)) return <JustBadge justSt={n.justSt} />
  return <StatusBadge st={n.st} />
}

export function OrigenBadge({ org }: { org: NovOrigen }) {
  if (org === 'automática')
    return (
      <Badge color="bl" tip="Generada por el motor de reglas al detectar una anomalía en la fichada del empleado.">
        Automática
      </Badge>
    )
  return (
    <Badge color="gy" tip="Cargada manualmente por el administrador o creada desde una solicitud del empleado.">
      Manual
    </Badge>
  )
}

export function FichOrigenBadge({ org }: { org: FichOrigen }) {
  const map: Record<FichOrigen, BadgeColor> = { biométrico: 'bl', manual: 'am', qr: 'pu' }
  return (
    <Badge color={map[org] ?? 'gy'}>
      {org.charAt(0).toUpperCase() + org.slice(1)}
    </Badge>
  )
}
