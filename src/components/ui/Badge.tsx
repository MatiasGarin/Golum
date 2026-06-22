import type { ReactNode } from 'react'
import type { Role, NovStatus, NovOrigen, UserStatus, FichOrigen } from '../../types'

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
    pendiente: ['pu', 'Pendiente'],
    aprobada: ['gn', 'Aprobada'],
    rechazada: ['rd', 'Rechazada'],
    activo: ['gn', 'Activo'],
    inactivo: ['rd', 'Inactivo'],
  }
  const [c, l] = map[st] ?? (['gy', st] as [BadgeColor, string])
  return <Badge color={c}>{l}</Badge>
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
