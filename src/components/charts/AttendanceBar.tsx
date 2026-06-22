import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../store/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function AttendanceBar() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const gc = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'
  const lc = dark ? '#94a3b8' : '#64748b'

  return (
    <Bar
      height={195}
      data={{
        labels: ['Lun 8', 'Mar 9', 'Mié 10', 'Jue 11', 'Vie 12', 'Lun 15', 'Mar 16', 'Mié 17', 'Jue 18'],
        datasets: [
          { label: 'Presentes', data: [5, 4, 5, 5, 5, 5, 5, 5, 5], backgroundColor: 'rgba(37,99,235,.8)', borderRadius: 5, borderSkipped: false },
          { label: 'Con tardanza', data: [0, 1, 0, 0, 0, 0, 0, 1, 0], backgroundColor: 'rgba(245,158,11,.8)', borderRadius: 5, borderSkipped: false },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { color: lc, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Inter', size: 11 } } },
        },
        scales: {
          x: { grid: { color: gc }, ticks: { color: lc, font: { family: 'Inter', size: 11 } }, border: { display: false } },
          y: { beginAtZero: true, max: 6, ticks: { color: lc, stepSize: 1, font: { family: 'Inter', size: 11 } }, grid: { color: gc }, border: { display: false } },
        },
      }}
    />
  )
}
