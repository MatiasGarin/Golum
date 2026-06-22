import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import type { Employee } from '../../types'
import { Sidebar, type NavItem } from './Sidebar'
import { NotificationBell } from './NotificationBell'
import { IconMenu } from '../ui/icons'

export function AppShell({
  badgeText,
  roleLine,
  user,
  items,
  titles,
}: {
  badgeText: string
  roleLine: string
  user: Employee
  items: NavItem[]
  titles: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const seg = loc.pathname.split('/').pop() || ''
  const title = titles[seg] ?? ''

  return (
    <div className="flex min-h-screen">
      <Sidebar badgeText={badgeText} items={items} user={user} roleLine={roleLine} open={open} onClose={() => setOpen(false)} />
      <main className="flex min-h-screen flex-1 flex-col md:ml-[240px]">
        <div className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-bd bg-card px-[22px] shadow-sh0">
          <div className="flex items-center gap-[10px]">
            <button
              onClick={() => setOpen(true)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-md border border-bd bg-card text-t2 transition-all hover:bg-bg md:hidden"
            >
              <IconMenu size={17} />
            </button>
            <h1 className="text-[17px] font-bold text-t1">{title}</h1>
          </div>
          <div className="flex items-center gap-[6px]">
            <NotificationBell />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-[22px]">
          <div className="anim-fsi" key={loc.pathname}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
