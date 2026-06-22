import { useData } from '../store/DataContext'
import { useToast } from '../store/ToastContext'
import { useConfirm } from '../store/ConfirmContext'

export function useNovActions() {
  const { approveNov, rejectNov } = useData()
  const toast = useToast()
  const confirm = useConfirm()

  const approve = (id: number) =>
    confirm({
      title: 'Aprobar novedad',
      msg: '¿Aprobar esta novedad? Se incluirá en la preliquidación del mes.',
      type: 'success',
      cb: () => {
        approveNov(id)
        toast('Novedad aprobada.', 'ok')
      },
    })

  const reject = (id: number) =>
    confirm({
      title: 'Rechazar novedad',
      msg: '¿Rechazar esta novedad? Quedará excluida de la preliquidación.',
      type: 'danger',
      cb: () => {
        rejectNov(id)
        toast('Novedad rechazada.', 'wa')
      },
    })

  return { approve, reject }
}
