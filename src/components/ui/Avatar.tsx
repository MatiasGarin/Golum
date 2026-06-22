import type { Employee } from '../../types'

export function Avatar({ emp, size = 'md' }: { emp: Employee; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-10 h-10 text-[15px]' : 'w-[30px] h-[30px] text-[11px]'
  return <div className={`av av${emp.av} ${dim}`}>{emp.ini}</div>
}
