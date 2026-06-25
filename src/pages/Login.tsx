import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../store/DataContext'
import { useTheme } from '../store/ThemeContext'
import { IconClock, IconShield, IconUser, IconMoon, IconSun } from '../components/ui/icons'

export function Login() {
  const { login } = useData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const enter = (role: 'admin' | 'empleado') => {
    login(role)
    navigate(role === 'admin' ? '/admin/dashboard' : '/emp/inicio')
  }

  // Dev-only deep-link: /login?as=admin|empleado auto-enters (handy for demos/QA).
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const as = params.get('as')
    if (as === 'admin' || as === 'empleado') enter(as)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb 45%,#0ea5e9)' }}
    >
      {/* grid pattern overlay (ported from #login-screen::before) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <button
        onClick={toggleTheme}
        title="Cambiar tema"
        className="absolute right-[18px] top-[18px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-white/[0.12] text-white transition-all hover:bg-white/[0.22]"
      >
        {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
      </button>

      <div className="relative z-[1] w-full max-w-[420px] p-5">
        <div
          className="rounded-rx border border-white/20 px-8 py-9 shadow-[0_25px_50px_rgba(0,0,0,.3)]"
          style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(20px)' }}
        >
          <div className="mb-[6px] flex items-center justify-center gap-[10px]">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-white shadow-[0_4px_12px_rgba(0,0,0,.2)]">
              <IconClock size={26} className="text-pr" strokeWidth={2.5} />
            </div>
            <div className="text-[26px] font-extrabold tracking-[-.5px] text-white">Gestión de RRHH</div>
          </div>
          <p className="mb-[30px] text-center text-[13px] leading-normal text-white/75">
            Sistema de Gestión de Asistencia
            <br />y Novedades Laborales
          </p>

          <div className="relative mb-4 text-center text-[12px] font-medium text-white/55">
            <span className="relative z-[1] bg-transparent px-2">Ingresá con tu rol</span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-[10px]">
            <RoleCard onClick={() => enter('admin')} icon={<IconShield size={22} />} title="Administrador" desc="Gestión completa del sistema" />
            <RoleCard onClick={() => enter('empleado')} icon={<IconUser size={22} />} title="Empleado" desc="Portal de autogestión" />
          </div>

          <div className="rounded-r border border-white/[0.13] bg-white/[0.07] px-[14px] py-[10px] text-center text-[12px] text-white/65">
            <strong className="text-white">Modo demo:</strong> hacé clic en cualquier rol para ingresar sin contraseña. Datos de muestra precargados.
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ onClick, icon, title, desc }: { onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-rl border border-white/[0.18] bg-white/10 px-[10px] py-[18px] text-center text-white transition-all hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.22] hover:shadow-[0_8px_20px_rgba(0,0,0,.2)]"
    >
      <div className="mx-auto mb-[10px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/[0.18]">{icon}</div>
      <div className="mb-[3px] text-[14px] font-bold">{title}</div>
      <div className="text-[11px] leading-tight text-white/65">{desc}</div>
    </button>
  )
}
