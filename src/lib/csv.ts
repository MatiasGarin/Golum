/** Escapa un campo CSV según RFC 4180: si contiene coma, comillas o salto de
 * línea, se envuelve en comillas dobles y las comillas internas se duplican. */
function escapeField(value: string | number): string {
  const s = String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Dispara la descarga de un Blob en el navegador. */
function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map(escapeField).join(',')).join('\r\n')
  // BOM UTF-8: sin esto, Excel en Windows abre el CSV como ANSI y rompe tildes/ñ.
  downloadBlob(filename, new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }))
}

/** Escapa texto para uso seguro dentro de un nodo/atributo XML. */
function escapeXML(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Convierte una clave de columna en un nombre de tag XML válido (sin espacios/acentos). */
function tagName(label: string): string {
  const t = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  return t || 'campo'
}

/**
 * Exporta filas tabulares a XML. La primera fila de `rows` son los encabezados,
 * que se usan como nombres de tag de cada campo dentro de cada `<fila>`.
 */
export function downloadXML(filename: string, rootTag: string, rows: (string | number)[][]) {
  const [headers = [], ...data] = rows
  const tags = headers.map((h) => tagName(String(h)))
  const body = data
    .map((row) => {
      const fields = row
        .map((cell, i) => `    <${tags[i]}>${escapeXML(cell)}</${tags[i]}>`)
        .join('\n')
      return `  <fila>\n${fields}\n  </fila>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${body}\n</${rootTag}>\n`
  downloadBlob(filename, new Blob(['﻿' + xml], { type: 'application/xml;charset=utf-8;' }))
}
