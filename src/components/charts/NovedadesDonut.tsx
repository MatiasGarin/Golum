import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../store/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLS = ['#2563eb', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316']

export function NovedadesDonut({ data }: { data: Record<string, number> }) {
  const { theme } = useTheme()
  const lc = theme === 'dark' ? '#94a3b8' : '#64748b'
  const labels = Object.keys(data)
  const vals = Object.values(data)

  return (
    <Doughnut
      height={180}
      data={{ labels, datasets: [{ data: vals, backgroundColor: COLS.slice(0, labels.length), borderWidth: 0, hoverOffset: 5 }] }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: lc, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Inter', size: 11 }, padding: 10 } },
        },
      }}
    />
  )
}
