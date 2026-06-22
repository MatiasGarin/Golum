import { Navigate, Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { AdminLayout } from './layouts/AdminLayout'
import { EmpLayout } from './layouts/EmpLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Usuarios } from './pages/admin/Usuarios'
import { Horarios } from './pages/admin/Horarios'
import { Fichadas } from './pages/admin/Fichadas'
import { Novedades } from './pages/admin/Novedades'
import { Cierre } from './pages/admin/Cierre'
import { Inicio } from './pages/emp/Inicio'
import { Asistencia } from './pages/emp/Asistencia'
import { EmpNovedades } from './pages/emp/Novedades'
import { Solicitudes } from './pages/emp/Solicitudes'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="fichadas" element={<Fichadas />} />
        <Route path="novedades" element={<Novedades />} />
        <Route path="cierre" element={<Cierre />} />
      </Route>
      <Route path="/emp" element={<EmpLayout />}>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="novedades" element={<EmpNovedades />} />
        <Route path="solicitudes" element={<Solicitudes />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
