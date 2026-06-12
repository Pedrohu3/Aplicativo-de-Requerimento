import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatValor } from '../components/DynamicForm'
import StatusBadge from '../components/StatusBadge'
import { getStoredUser } from '../services/authService'
import {
  aprovarRequerimento,
  buscarRequerimento,
  buscarTipo,
  cancelarRequerimento,
} from '../services/requerimentoService'

export default function RequerimentoDetalhePage() {
  const { id } = useParams()
  const user = getStoredUser()
  const [requerimento, setRequerimento] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const data = await buscarRequerimento(id)
      setRequerimento(data)
      const tipoData = await buscarTipo(data.tipoRequerimentoId)
      setTipo(tipoData)
    } catch {
      setError('Erro ao carregar requerimento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleAprovacao(acao) {
    setActionLoading(true)
    setError('')
    try {
      await aprovarRequerimento(id, { acao, observacao })
      setObservacao('')
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao registrar aprovação.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelar() {
    setActionLoading(true)
    try {
      await cancelarRequerimento(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao cancelar.')
    } finally {
      setActionLoading(false)
    }
  }

  const podeAprovar =
    requerimento?.status === 'EM_APROVACAO' &&
    (user?.role === 'ADMIN' || user?.role === requerimento?.etapaAtualRole)

  const podeCancelar =
    requerimento &&
    ['RASCUNHO', 'EM_APROVACAO'].includes(requerimento.status) &&
    (user?.email === requerimento.solicitanteEmail || user?.role === 'ADMIN')

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando...</p>
  }

  if (!requerimento || !tipo) {
    return <p className="text-sm text-red-600">{error || 'Requerimento não encontrado.'}</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/meus-requerimentos" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Voltar
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{requerimento.tipoRequerimentoNome}</h2>
            <p className="text-sm text-slate-500">
              Solicitante: {requerimento.solicitanteNome} ·{' '}
              {new Date(requerimento.criadoEm).toLocaleString('pt-BR')}
            </p>
          </div>
          <StatusBadge status={requerimento.status} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6">
          <h3 className="mb-3 font-semibold text-slate-800">Respostas do formulário</h3>
          <div className="space-y-3">
            {tipo.campos.map((campo) => (
              <div key={campo.id} className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{campo.label}</p>
                <p className="mt-1 text-sm text-slate-800">
                  {formatValor(campo, requerimento.valores[String(campo.id)])}
                </p>
              </div>
            ))}
          </div>
        </section>

        {requerimento.status === 'EM_APROVACAO' && (
          <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              Etapa {requerimento.etapaAtual + 1}: aguardando {requerimento.etapaAtualRole}
            </p>
            {requerimento.etapaAtualDescricao && (
              <p className="text-sm text-amber-700">{requerimento.etapaAtualDescricao}</p>
            )}
          </section>
        )}

        {podeAprovar && (
          <section className="mb-6 space-y-3 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800">Ação de aprovação</h3>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observação (opcional)"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAprovacao('APROVADO')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Aprovar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAprovacao('REJEITADO')}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Rejeitar
              </button>
            </div>
          </section>
        )}

        {podeCancelar && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCancelar}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Cancelar requerimento
          </button>
        )}

        {requerimento.historico?.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-3 font-semibold text-slate-800">Histórico de aprovação</h3>
            <ul className="space-y-3">
              {requerimento.historico.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
                  <p className="font-medium text-slate-800">
                    {item.aprovadorNome} — {item.acao === 'APROVADO' ? 'Aprovou' : 'Rejeitou'} ({item.roleEtapa})
                  </p>
                  {item.observacao && <p className="text-slate-600">{item.observacao}</p>}
                  <p className="text-xs text-slate-400">{new Date(item.criadoEm).toLocaleString('pt-BR')}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
