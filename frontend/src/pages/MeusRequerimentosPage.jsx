import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { enviarRequerimento, listarMeusRequerimentos } from '../services/requerimentoService'

export default function MeusRequerimentosPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setItems(await listarMeusRequerimentos())
    } catch {
      setError('Erro ao carregar requerimentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleEnviar(id) {
    try {
      await enviarRequerimento(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao enviar requerimento.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Meus Requerimentos</h2>
          <p className="text-sm text-slate-500">Acompanhe o status dos seus pedidos.</p>
        </div>
        <Link
          to="/novo-requerimento"
          className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Novo requerimento
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Você ainda não criou requerimentos.</p>
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
                    Criado em {new Date(item.criadoEm).toLocaleString('pt-BR')}
                  </p>
                  {item.status === 'EM_APROVACAO' && item.etapaAtualRole && (
                    <p className="text-xs text-amber-700">
                      Aguardando: {item.etapaAtualRole}
                      {item.etapaAtualDescricao ? ` — ${item.etapaAtualDescricao}` : ''}
                    </p>
                  )}
                  {item.status === 'AJUSTES_SOLICITADOS' && (
                    <p className="text-xs font-medium text-orange-700">Precisa de ajustes — edite e reenvie</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {item.status === 'RASCUNHO' && (
                    <button
                      type="button"
                      onClick={() => handleEnviar(item.id)}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Enviar
                    </button>
                  )}
                  {item.status === 'AJUSTES_SOLICITADOS' && (
                    <Link
                      to={`/requerimentos/${item.id}/editar`}
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                      Editar e reenviar
                    </Link>
                  )}
                  <Link
                    to={`/requerimentos/${item.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Detalhes
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
