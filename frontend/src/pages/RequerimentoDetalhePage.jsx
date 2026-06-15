import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  const navigate = useNavigate()
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

  const podeAprovar = requerimento?.podeAprovarAtual === true

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
    <div className="w-full space-y-6 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Detalhe do requerimento</h2>
          <p className="text-sm text-slate-500">Acompanhe o status, respostas e histórico da solicitação.</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => navigate(`/requerimentos/${id}/editar`)}
              className="rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-100"
            >
              Editar
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/meus-requerimentos')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Requerimento</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{requerimento.tipoRequerimentoNome}</h3>
            <p className="mt-1 text-sm text-slate-600">
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

        {tipo.etapas?.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-4 font-semibold text-slate-800">Fluxo de aprovação</h3>
            <ol className="space-y-1">
              {tipo.etapas.map((etapa, index) => {
                const concluida = requerimento.historico?.[index]
                const isAtual = !concluida && index === (requerimento.historico?.length ?? 0) && requerimento.status === 'EM_APROVACAO'
                const isFutura = !concluida && !isAtual
                const hasNext = index < tipo.etapas.length - 1

                let circulo, label, sublabel
                if (concluida) {
                  const approved = concluida.acao === 'APROVADO'
                  circulo = `${approved ? 'bg-emerald-500' : 'bg-red-400'} text-white`
                  label = <p className="text-sm font-semibold text-slate-800">{concluida.aprovadorNome}</p>
                  sublabel = (
                    <>
                      <p className={`text-xs ${approved ? 'text-emerald-600' : 'text-red-500'}`}>{approved ? 'Aprovado' : 'Rejeitado'}</p>
                      {concluida.observacao && <p className="mt-1 text-xs italic text-slate-600">{concluida.observacao}</p>}
                    </>
                  )
                } else if (isAtual) {
                  circulo = 'bg-amber-400 text-white ring-4 ring-amber-100'
                  label = <p className="text-sm font-semibold text-amber-800">Aguardando aprovação</p>
                  sublabel = etapa.descricao && <p className="text-xs text-amber-700">{etapa.descricao}</p>
                } else {
                  circulo = 'bg-slate-200 text-slate-400'
                  label = <p className="text-sm text-slate-400">Pendente</p>
                  sublabel = etapa.descricao && <p className="text-xs text-slate-400">{etapa.descricao}</p>
                }

                return (
                  <li key={etapa.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${circulo}`}>
                        {index + 1}
                      </span>
                      {hasNext && <div className="mt-1 w-0.5 flex-1 min-h-[1.5rem] bg-slate-200" />}
                    </div>
                    <div className={`pb-5 min-w-0 ${isFutura ? 'opacity-40' : ''}`}>
                      <p className={`text-xs font-medium uppercase tracking-wide ${isAtual ? 'text-amber-600' : 'text-slate-400'}`}>{etapa.role}</p>
                      {label}
                      {sublabel}
                    </div>
                  </li>
                )
              })}
            </ol>
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

      </section>
    </div>
  )
}
