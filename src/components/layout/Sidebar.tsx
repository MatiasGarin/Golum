import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Employee } from '../../types'
import { useTheme } from '../../store/ThemeContext'
import { useData } from '../../store/DataContext'
import { useNavigate } from 'react-router-dom'
import { IconClock, IconLogout, IconMoon, IconSun } from '../ui/icons'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  badge?: number
  section?: string
}

export function Sidebar({
  badgeText,
  items,
  user,
  roleLine,
  open,
  onClose,
}: {
  badgeText: string
  items: NavItem[]
  user: Employee
  roleLine: string
  open: boolean
  onClose: () => void
}) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useData()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[240px] flex-col bg-sb transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center gap-[10px] border-b border-white/[0.07] px-[14px] py-[18px]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-pr">
            <IconClock size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[16px] font-extrabold tracking-[-.3px] text-white">GestRRHH</div>
            <span className="mt-px block text-[9px] font-semibold uppercase tracking-[1px] text-white/40">{badgeText}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-[10px]">
          {items.map((it) => (
            <div key={it.to}>
              {it.section && <div className="px-2 pb-[5px] pt-3 text-[10px] font-semibold uppercase tracking-[1.2px] text-white/30">{it.section}</div>}
              <NavLink
                to={it.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `mb-[2px] flex items-center gap-[10px] rounded-md px-[11px] py-[9px] text-[13px] font-medium transition-all ${
                    isActive ? 'bg-sb-a text-white shadow-[0_4px_12px_rgba(37,99,235,.4)]' : 'text-tsb hover:bg-sb-h hover:text-white'
                  }`
                }
              >
                {it.icon}
                <span>{it.label}</span>
                {it.badge != null && it.badge > 0 && (
                  <span className="ml-auto min-w-[18px] rounded-rf bg-er px-[6px] text-center text-[10px] font-bold text-white">{it.badge}</span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.07] px-2 py-[10px]">
          <div className="flex items-center gap-[9px] rounded-md px-[11px] py-[9px]">
            <div className={`av av${user.av} h-[30px] w-[30px] text-[11px]`}>{user.ini}</div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-white">{user.name}</div>
              <div className="text-[10px] text-white/40">{roleLine}</div>
            </div>
          </div>
          <div className="flex gap-1 px-[11px] pt-[3px]">
            <button onClick={toggleTheme} className="flex flex-1 items-center justify-center gap-1 rounded-md px-[6px] py-[6px] text-[11px] font-medium text-white/45 transition-all hover:bg-sb-h hover:text-white">
              {theme === 'dark' ? <IconSun size={13} /> : <IconMoon size={13} />}
              Tema
            </button>
            <button onClick={doLogout} className="flex flex-1 items-center justify-center gap-1 rounded-md px-[6px] py-[6px] text-[11px] font-medium text-white/45 transition-all hover:bg-sb-h hover:text-white">
              <IconLogout size={13} />
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-[99] bg-black/50 md:hidden" onClick={onClose} />}
    </>
  )
}
