import { useData } from '../store/DataContext'
import { useToast } from '../store/ToastContext'
import { useConfirm } from '../store/ConfirmContext'
import { requiereAutorizacion } from '../lib/novedad'
import type { Novedad } from '../types'

/**
 * Acciones de resolución sobre novedades. Hay dos flujos según el tipo:
 *  - Horas Extra → AUTORIZAR / rechazar (habilita o no su pago).
 *  - Desvíos con justificación pendiente → APROBAR / rechazar la justificación
 *    (al aprobarse, el desvío queda excluido del reporte).
 */
export function useNovActions() {
  const { autorizarHE, resolverJustificacion } = useData()
  const toast = useToast()
  const confirm = useConfirm()

  const autorizar = (id: number) =>
    confirm({
      title: 'Autorizar hora extra',
      msg: '¿Autorizar esta hora extra? Se computará y pagará en la preliquidación del mes.',
      type: 'success',
      cb: () => {
        autorizarHE(id, true)
        toast('Hora extra autorizada.', 'ok')
      },
    })

  const rechazarHE = (id: number) =>
    confirm({
      title: 'Rechazar hora extra',
      msg: '¿Rechazar esta hora extra? No se pagará.',
      type: 'danger',
      cb: () => {
        autorizarHE(id, false)
        toast('Hora extra rechazada.', 'wa')
      },
    })

  const aprobarJust = (id: number) =>
    confirm({
      title: 'Aprobar justificación',
      msg: '¿Aprobar la justificación? El desvío quedará excluido de las faltas injustificadas / minutos del reporte.',
      type: 'success',
      cb: () => {
        resolverJustificacion(id, true)
        toast('Justificación aprobada.', 'ok')
      },
    })

  const rechazarJust = (id: number) =>
    confirm({
      title: 'Rechazar justificación',
      msg: '¿Rechazar la justificación? El desvío seguirá computando en el reporte.',
      type: 'danger',
      cb: () => {
        resolverJustificacion(id, false)
        toast('Justificación rechazada.', 'wa')
      },
    })

  /** Aprueba (ok) o rechaza una novedad, eligiendo el flujo según su tipo. */
  const resolver = (n: Novedad, ok: boolean) => {
    if (requiereAutorizacion(n.type)) ok ? autorizar(n.id) : rechazarHE(n.id)
    else ok ? aprobarJust(n.id) : rechazarJust(n.id)
  }

  return { autorizar, rechazarHE, aprobarJust, rechazarJust, resolver }
}
