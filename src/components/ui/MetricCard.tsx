import type { ReactNode } from 'react'

type MetricColor = 'bl' | 'gn' | 'rd' | 'am' | 'pu'

const ICON_CLS: Record<MetricColor, string> = {
  bl: 'bg-in-l text-in',
  gn: 'bg-ok-l text-ok',
  rd: 'bg-er-l text-er',
  am: 'bg-wa-l text-wa',
  pu: 'bg-pu-l text-pu',
}

export function MetricCard({
  color,
  icon,
  label,
  value,
  sub,
  tip,
}: {
  color: MetricColor
  icon: ReactNode
  label: string
  value: ReactNode
  sub: ReactNode
  tip?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-rl border border-bd bg-card p-[18px] shadow-sh0 transition-all hover:-translate-y-px hover:shadow-sh">
      <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-r ${ICON_CLS[color]}`}>{icon}</div>
      <div>
        <div className="mb-[3px] text-[11px] font-medium text-t2" data-tip={tip}>
          {label}
        </div>
        <div className="mb-[3px] text-[24px] font-extrabold leading-none text-t1">{value}</div>
        <div className="text-[11px] text-tm">{sub}</div>
      </div>
    </div>
  )
}
