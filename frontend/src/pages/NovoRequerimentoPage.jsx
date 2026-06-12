import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DynamicForm from '../components/DynamicForm'
import {
  buscarTipo,
  criarRequerimento,
  listarTiposAtivos,
} from '../services/requerimentoService'

export default function NovoRequerimentoPage() {
  const [tipos, setTipos] = useState([])
  const [tipoId, setTipoId] = useState('')
  const [tipo, setTipo] = useState(null)
  const [valores, setValores] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    listarTiposAtivos()
      .then(setTipos)
      .catch(() => setError('Erro ao carregar tipos disponíveis.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!tipoId) {
      setTipo(null)
      setValores({})
      return
    }
    buscarTipo(tipoId)
      .then((data) => {
        setTipo(data)
        setValores({})
      })
      .catch(() => setError('Erro ao carregar formulário.'))
  }, [tipoId])

  async function handleSubmit(enviar) {
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await criarRequerimento({
        tipoRequerimentoId: Number(tipoId),
        valores,
        enviar,
      })
      setSuccess(enviar ? 'Requerimento enviado para aprovação!' : 'Rascunho salvo com sucesso!')
      setValores({})
      setTipoId('')
      setTipo(null)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao criar requerimento.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Novo Requerimento</h2>
        <p className="text-sm text-slate-500">Selecione um tipo e preencha o formulário dinâmico.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}{' '}
          <Link to="/meus-requerimentos" className="font-semibold underline">
            Ver meus requerimentos
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : tipos.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum tipo disponível. Peça a um coordenador ou admin para cadastrar um tipo.
          </p>
        ) : (
          <>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de requerimento</span>
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              >
                <option value="">Selecione...</option>
                {tipos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>

            {tipo && (
              <>
                <p className="mb-4 text-sm text-slate-500">{tipo.descricao}</p>
                <DynamicForm campos={tipo.campos} valores={valores} onChange={setValores} />
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Salvar rascunho
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                    className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Enviar para aprovação
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
