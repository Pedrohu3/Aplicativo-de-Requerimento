import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatValor } from '../components/DynamicForm'
import StatusBadge from '../components/StatusBadge'
import { getStoredUser, isAdmin } from '../services/authService'
import {
  MOTIVOS_REJEICAO,
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
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [pendingAcao, setPendingAcao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [prazoProximo, setPrazoProximo] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const data = await buscarRequerimento(id)
      setRequerimento(data)
      setPrazoProximo(
        Boolean(data.prazoEm) && new Date(data.prazoEm).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000,
      )
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

  async function confirmarAprovacao() {
    const acao = pendingAcao
    setActionLoading(true)
    setError('')
    try {
      await aprovarRequerimento(id, {
        acao,
        observacao,
        motivoRejeicao: acao === 'REJEITADO' ? motivoRejeicao : undefined,
      })
      setObservacao('')
      setMotivoRejeicao('')
      setPendingAcao(null)
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

  const ehSolicitante = user?.email === requerimento?.solicitanteEmail

  const podeEditarEReenviar =
    requerimento?.status === 'AJUSTES_SOLICITADOS' && (ehSolicitante || isAdmin(user))

  const podeCancelar =
    requerimento &&
    ['RASCUNHO', 'EM_APROVACAO', 'AJUSTES_SOLICITADOS'].includes(requerimento.status) &&
    (ehSolicitante || isAdmin(user))

  const ultimoAjuste = requerimento?.status === 'AJUSTES_SOLICITADOS'
    ? [...(requerimento.historico ?? [])].reverse().find((h) => h.acao === 'AJUSTES_SOLICITADOS')
    : null

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
          {(isAdmin(user) || podeEditarEReenviar) && (
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
            {requerimento.disciplinaNome && (
              <p className="mt-1 text-sm text-slate-600">Disciplina: {requerimento.disciplinaNome}</p>
            )}
            {requerimento.status === 'EM_APROVACAO' && requerimento.prazoEm && (
              <p className={`mt-1 text-sm font-medium ${prazoProximo ? 'text-red-600' : 'text-slate-600'}`}>
                Prazo para aprovação: {new Date(requerimento.prazoEm).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <StatusBadge status={requerimento.status} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {requerimento.status === 'AJUSTES_SOLICITADOS' && ehSolicitante && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">Este requerimento precisa de ajustes</p>
            {ultimoAjuste?.observacao && (
              <p className="mt-1 text-sm text-orange-700">{ultimoAjuste.observacao}</p>
            )}
            <p className="mt-2 text-xs text-orange-600">
              Corrija o que foi apontado e reenvie — ele volta direto para quem solicitou o ajuste.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/requerimentos/${id}/editar`)}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Editar e reenviar
            </button>
          </div>
        )}

        <section className="mb-6">
          <h3 className="mb-3 font-semibold text-slate-800">Respostas do formulário</h3>
          <div className="space-y-3">
            {tipo.campos.map((campo) => {
              const valor = requerimento.valores[String(campo.id)]
              const sepIdx = campo.tipo === 'ANEXO' && valor ? valor.indexOf('||') : -1
              const anexoNome = sepIdx >= 0 ? valor.slice(0, sepIdx) : ''
              const anexoUrl = sepIdx >= 0 ? valor.slice(sepIdx + 2) : ''
              return (
                <div key={campo.id} className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{campo.label}</p>
                  {campo.tipo === 'ANEXO' ? (
                    anexoUrl ? (
                      <a
                        href={anexoUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={anexoNome}
                        className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        {anexoNome || 'Baixar anexo'}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">Nenhum arquivo anexado</p>
                    )
                  ) : (
                    <p className="mt-1 text-sm text-slate-800">{formatValor(campo, valor)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {tipo.etapas?.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-4 font-semibold text-slate-800">Fluxo de aprovação</h3>
            <ol className="space-y-1">
              {tipo.etapas.map((etapa, index) => {
                // Uma etapa pode ter mais de uma entrada no histórico (idas e
                // voltas de "ajustes solicitados"), então o histórico não tem
                // mais correspondência 1:1 por posição — é preciso casar pela
                // etapaOrdem, não pelo índice.
                const entradasEtapa = (requerimento.historico ?? []).filter((h) => h.etapaOrdem === index)
                const aprovadaEntrada = entradasEtapa.find((h) => h.acao === 'APROVADO')
                const rejeitadaEntrada = entradasEtapa.find((h) => h.acao === 'REJEITADO')
                const ajustesEntradas = entradasEtapa.filter((h) => h.acao === 'AJUSTES_SOLICITADOS')
                const concluida = aprovadaEntrada ?? rejeitadaEntrada
                const isAtual = !concluida && index === requerimento.etapaAtual
                  && ['EM_APROVACAO', 'AJUSTES_SOLICITADOS'].includes(requerimento.status)
                const isFutura = !concluida && !isAtual
                const hasNext = index < tipo.etapas.length - 1
                const ajustesAtivo = isAtual && requerimento.status === 'AJUSTES_SOLICITADOS'

                let circulo, label, sublabel
                if (concluida) {
                  const approved = concluida.acao === 'APROVADO'
                  circulo = `${approved ? 'bg-emerald-500' : 'bg-red-400'} text-white`
                  label = <p className="text-sm font-semibold text-slate-800">{concluida.aprovadorNome}</p>
                  sublabel = (
                    <>
                      <p className={`text-xs ${approved ? 'text-emerald-600' : 'text-red-500'}`}>{approved ? 'Aprovado' : 'Rejeitado'}</p>
                      {concluida.motivoRejeicao && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {MOTIVOS_REJEICAO.find((m) => m.value === concluida.motivoRejeicao)?.label ?? concluida.motivoRejeicao}
                        </p>
                      )}
                      {concluida.observacao && <p className="mt-1 text-xs italic text-slate-600">{concluida.observacao}</p>}
                    </>
                  )
                } else if (isAtual) {
                  circulo = ajustesAtivo
                    ? 'bg-orange-400 text-white ring-4 ring-orange-100'
                    : 'bg-amber-400 text-white ring-4 ring-amber-100'
                  label = (
                    <p className={`text-sm font-semibold ${ajustesAtivo ? 'text-orange-800' : 'text-amber-800'}`}>
                      {ajustesAtivo ? 'Ajustes solicitados' : 'Aguardando aprovação'}
                    </p>
                  )
                  sublabel = etapa.descricao && (
                    <p className={`text-xs ${ajustesAtivo ? 'text-orange-700' : 'text-amber-700'}`}>{etapa.descricao}</p>
                  )
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
                      <p className={`text-xs font-medium uppercase tracking-wide ${isAtual ? (ajustesAtivo ? 'text-orange-600' : 'text-amber-600') : 'text-slate-400'}`}>{etapa.role}</p>
                      {label}
                      {sublabel}
                      {ajustesEntradas.length > 0 && (
                        <div className="mt-2 space-y-2 border-l-2 border-orange-200 pl-3">
                          {ajustesEntradas.map((h) => (
                            <div key={h.id}>
                              <p className="text-xs font-medium text-orange-700">
                                Ajustes solicitados por {h.aprovadorNome}
                              </p>
                              {h.observacao && <p className="text-xs italic text-slate-600">{h.observacao}</p>}
                            </div>
                          ))}
                        </div>
                      )}
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
                onClick={() => setPendingAcao('APROVADO')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setPendingAcao('AJUSTES_SOLICITADOS')}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                Solicitar ajustes
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setPendingAcao('REJEITADO')}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
            <p className="text-xs text-slate-500">
              "Solicitar ajustes" devolve o requerimento pro solicitante corrigir e reenviar — ele volta
              direto pra sua fila, sem reiniciar o fluxo. Descreva o que precisa ser corrigido na observação acima.
            </p>
          </section>
        )}

        <ConfirmDialog
          open={pendingAcao !== null}
          title={
            pendingAcao === 'REJEITADO'
              ? 'Rejeitar requerimento?'
              : pendingAcao === 'AJUSTES_SOLICITADOS'
                ? 'Solicitar ajustes?'
                : 'Aprovar requerimento?'
          }
          message={
            pendingAcao === 'REJEITADO'
              ? 'Tem certeza que deseja rejeitar este requerimento? O solicitante será notificado por e-mail.'
              : pendingAcao === 'AJUSTES_SOLICITADOS'
                ? 'O requerimento volta para o solicitante corrigir e reenviar, retomando na mesma etapa. Ele será notificado por e-mail com a observação acima.'
                : 'Tem certeza que deseja aprovar este requerimento?'
          }
          confirmLabel={
            pendingAcao === 'REJEITADO'
              ? 'Rejeitar'
              : pendingAcao === 'AJUSTES_SOLICITADOS'
                ? 'Solicitar ajustes'
                : 'Aprovar'
          }
          variant={
            pendingAcao === 'REJEITADO'
              ? 'danger'
              : pendingAcao === 'AJUSTES_SOLICITADOS'
                ? 'warning'
                : 'success'
          }
          confirmDisabled={
            actionLoading ||
            (pendingAcao === 'REJEITADO' &&
              (!motivoRejeicao || (motivoRejeicao === 'OUTRO' && !observacao.trim()))) ||
            (pendingAcao === 'AJUSTES_SOLICITADOS' && !observacao.trim())
          }
          onConfirm={confirmarAprovacao}
          onCancel={() => setPendingAcao(null)}
        >
          {pendingAcao === 'REJEITADO' && (
            <div className="space-y-3">
              <label className="block text-left">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Motivo da rejeição
                </span>
                <select
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {MOTIVOS_REJEICAO.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
              {motivoRejeicao === 'OUTRO' && (
                <label className="block text-left">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Descreva o motivo
                  </span>
                  <textarea
                    rows={3}
                    autoFocus
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Explique o motivo da rejeição"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                  />
                </label>
              )}
            </div>
          )}
        </ConfirmDialog>

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
