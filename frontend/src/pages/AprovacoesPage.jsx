import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { listarPendentes } from '../services/requerimentoService'

export default function AprovacoesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarPendentes()
      .then(setItems)
      .catch((err) => {
        setError(err.response?.data?.message ?? 'Erro ao carregar fila de aprovação.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Fila de Aprovação</h2>
        <p className="text-sm text-slate-500">
          Requerimentos aguardando sua análise conforme seu perfil.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Nenhum requerimento pendente no momento.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{item.tipoRequerimentoNome}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-slate-500">
                    Solicitante: {item.solicitanteNome} ({item.solicitanteEmail})
                  </p>
                  <p className="text-xs text-amber-700">
                    Etapa atual: {item.etapaAtualRole}
                    {item.etapaAtualDescricao ? ` — ${item.etapaAtualDescricao}` : ''}
                  </p>
                </div>
                <Link
                  to={`/requerimentos/${item.id}`}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Analisar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
