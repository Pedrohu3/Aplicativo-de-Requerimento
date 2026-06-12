import { STATUS_COLORS, STATUS_LABELS } from '../services/requerimentoService'

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
