import { Navigate } from 'react-router-dom'
import { useData } from '../store/DataContext'
import { AppShell } from '../components/layout/AppShell'
import type { NavItem } from '../components/layout/Sidebar'
import { IconHome, IconUsers, IconClock, IconFileText, IconBell, IconBarChart } from '../components/ui/icons'

export function AdminLayout() {
  const { currentUser, novedades } = useData()
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const pend = novedades.filter((n) => n.st === 'pendiente').length

  const items: NavItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <IconHome size={15} />, section: 'Principal' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: <IconUsers size={15} />, section: 'Gestión' },
    { to: '/admin/horarios', label: 'Horarios', icon: <IconClock size={15} /> },
    { to: '/admin/fichadas', label: 'Fichadas', icon: <IconFileText size={15} /> },
    { to: '/admin/novedades', label: 'Novedades', icon: <IconBell size={15} />, badge: pend },
    { to: '/admin/cierre', label: 'Cierre Mensual', icon: <IconBarChart size={15} /> },
  ]

  const titles = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    horarios: 'Horarios',
    fichadas: 'Fichadas',
    novedades: 'Novedades',
    cierre: 'Cierre Mensual',
  }

  return <AppShell badgeText="Panel Admin" roleLine="Administradora · Leg. 001" user={currentUser} items={items} titles={titles} />
}
