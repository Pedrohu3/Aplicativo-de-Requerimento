import { STATUS_COLORS, STATUS_LABELS } from '../services/requerimentoService'

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
