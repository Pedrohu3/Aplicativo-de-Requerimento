import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import DynamicForm from '../components/DynamicForm'
import { getStoredUser, isAdmin } from '../services/authService'
import {
  atualizarRequerimento,
  buscarRequerimento,
  buscarTipo,
  enviarRequerimento,
} from '../services/requerimentoService'

export default function EditarRequerimentoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getStoredUser()

  const [requerimento, setRequerimento] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [valores, setValores] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const req = await buscarRequerimento(id)
        const t = await buscarTipo(req.tipoRequerimentoId)
        setRequerimento(req)
        setTipo(t)
        setValores(req.valores ?? {})
      } catch {
        setError('Erro ao carregar requerimento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <p className="text-sm text-slate-500">Carregando...</p>
  if (!requerimento || !tipo) {
    return <p className="text-sm text-red-600">{error || 'Requerimento não encontrado.'}</p>
  }

  const ehSolicitante = user?.email === requerimento.solicitanteEmail
  const emAjustes = requerimento.status === 'AJUSTES_SOLICITADOS'
  const podeEditar = isAdmin(user) || (ehSolicitante && emAjustes)
  if (!podeEditar) return <Navigate to={`/requerimentos/${id}`} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await atualizarRequerimento(id, {
        tipoRequerimentoId: requerimento.tipoRequerimentoId,
        valores,
      })
      navigate(`/requerimentos/${id}`)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao salvar requerimento.')
      setSaving(false)
    }
  }

  async function handleSalvarEReenviar() {
    setSaving(true)
    setError('')
    try {
      await atualizarRequerimento(id, {
        tipoRequerimentoId: requerimento.tipoRequerimentoId,
        valores,
      })
      await enviarRequerimento(id)
      navigate(`/requerimentos/${id}`)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao reenviar requerimento.')
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Editar requerimento</h2>
          <p className="text-sm text-slate-500">
            {requerimento.tipoRequerimentoNome} · Solicitante: {requerimento.solicitanteNome}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/requerimentos/${id}`)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Voltar
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {emAjustes && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            Corrija os campos apontados e reenvie — o requerimento volta direto para quem solicitou o ajuste.
          </div>
        )}

        <DynamicForm campos={tipo.campos} valores={valores} onChange={setValores} />

        <div className="flex flex-wrap gap-3">
          {emAjustes && ehSolicitante ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleSalvarEReenviar}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? 'Enviando...' : 'Salvar e reenviar'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/requerimentos/${id}`)}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
