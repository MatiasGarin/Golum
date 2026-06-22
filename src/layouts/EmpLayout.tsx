import { Navigate } from 'react-router-dom'
import { useData } from '../store/DataContext'
import { EMP_ID } from '../data/seed'
import { AppShell } from '../components/layout/AppShell'
import type { NavItem } from '../components/layout/Sidebar'
import { IconHome, IconCalendar, IconBell, IconFilePlus } from '../components/ui/icons'

export function EmpLayout() {
  const { currentUser, novedades } = useData()
  if (!currentUser || currentUser.role !== 'empleado') return <Navigate to="/login" replace />

  const pend = novedades.filter((n) => n.eId === EMP_ID && n.st === 'pendiente').length

  const items: NavItem[] = [
    { to: '/emp/inicio', label: 'Inicio', icon: <IconHome size={15} />, section: 'Mi espacio' },
    { to: '/emp/asistencia', label: 'Mi Asistencia', icon: <IconCalendar size={15} /> },
    { to: '/emp/novedades', label: 'Mis Novedades', icon: <IconBell size={15} />, badge: pend },
    { to: '/emp/solicitudes', label: 'Solicitudes', icon: <IconFilePlus size={15} /> },
  ]

  const titles = {
    inicio: 'Inicio',
    asistencia: 'Mi Asistencia',
    novedades: 'Mis Novedades',
    solicitudes: 'Solicitudes',
  }

  return <AppShell badgeText="Portal Empleado" roleLine="Empleado · Leg. 006" user={currentUser} items={items} titles={titles} />
}
