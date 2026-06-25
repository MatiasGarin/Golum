/** Escapa un campo CSV según RFC 4180: si contiene coma, comillas o salto de
 * línea, se envuelve en comillas dobles y las comillas internas se duplican. */
function escapeField(value: string | number): string {
  const s = String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map(escapeField).join(',')).join('\r\n')
  // BOM UTF-8: sin esto, Excel en Windows abre el CSV como ANSI y rompe tildes/ñ.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
