import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DynamicForm from '../components/DynamicForm'
import { getStoredUser } from '../services/authService'
import { listarDisciplinas } from '../services/disciplinasService'
import {
  buscarTipo,
  criarRequerimento,
  listarTiposAtivos,
} from '../services/requerimentoService'

export default function NovoRequerimentoPage() {
  const navigate = useNavigate()
  const [tipos, setTipos] = useState([])
  const [tipoId, setTipoId] = useState('')
  const [tipo, setTipo] = useState(null)
  const [valores, setValores] = useState({})
  const [disciplinas, setDisciplinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const exigeDisciplina = tipo?.escopo === 'DISCIPLINA'
  const campoDisciplina = tipo?.campos.find((c) => c.fixo && c.label === 'Disciplina')
  const disciplinaNomeSelecionado = campoDisciplina ? valores[String(campoDisciplina.id)] : null
  const disciplinaId = disciplinaNomeSelecionado
    ? disciplinas.find((d) => d.nome === disciplinaNomeSelecionado)?.id ?? null
    : null
  const camposParaExibir = tipo?.campos.map((c) =>
    c === campoDisciplina ? { ...c, opcoes: disciplinas.map((d) => d.nome) } : c,
  )

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
      setDisciplinas([])
      return
    }
    buscarTipo(tipoId)
      .then((data) => {
        setTipo(data)
        const user = getStoredUser()
        const prefilled = {}
        data.campos.filter((c) => c.fixo).forEach((campo) => {
          if (campo.label === 'Nome') prefilled[String(campo.id)] = user?.name ?? ''
          else if (campo.label === 'Matrícula') prefilled[String(campo.id)] = user?.matricula ?? ''
          else if (campo.label === 'Curso') prefilled[String(campo.id)] = user?.cursoNome ?? ''
        })
        setValores(prefilled)

        if (data.escopo === 'DISCIPLINA' && user?.cursoId) {
          listarDisciplinas(user.cursoId)
            .then(setDisciplinas)
            .catch(() => setError('Erro ao carregar disciplinas.'))
        } else {
          setDisciplinas([])
        }
      })
      .catch(() => setError('Erro ao carregar formulário.'))
  }, [tipoId])

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleSubmit(enviar) {
    if (enviar && exigeDisciplina && !disciplinaId) {
      setError('Selecione a disciplina para enviar este requerimento.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await criarRequerimento({
        tipoRequerimentoId: Number(tipoId),
        valores,
        enviar,
        disciplinaId: disciplinaId ? Number(disciplinaId) : null,
      })

      if (enviar) {
        setToast('Requerimento enviado com sucesso!')
        navigate('/meus-requerimentos')
        return
      }

      setToast('Rascunho salvo com sucesso!')
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
    <div className="w-full space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Novo Requerimento</h2>
        <p className="text-sm text-slate-500">Selecione um tipo e preencha o formulário dinâmico.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg">
          {toast}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : tipos.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum tipo disponível. Peça a um coordenador ou admin para cadastrar um tipo.
          </p>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-left">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de requerimento</span>
                <select
                  value={tipoId}
                  onChange={(e) => setTipoId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-left"
                >
                  <option value="">Selecione...</option>
                  {tipos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {tipo && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Requerimento selecionado</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{tipo.nome}</h3>
                      <p className="mt-1 text-sm text-slate-600">{tipo.descricao}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Em preenchimento</span>
                  </div>

                  {exigeDisciplina && disciplinas.length === 0 && (
                    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Nenhuma disciplina cadastrada para o seu curso. Peça a um administrador para cadastrar.
                    </p>
                  )}

                  <DynamicForm campos={camposParaExibir} valores={valores} onChange={setValores} />

                  {exigeDisciplina && disciplinas.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500">
                      Professor responsável por disciplina:{' '}
                      {disciplinas.map((d) => `${d.nome} — ${d.professorNome ?? 'sem professor definido'}`).join(' · ')}
                    </p>
                  )}

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
                      disabled={submitting || (exigeDisciplina && !disciplinaId)}
                      onClick={() => handleSubmit(true)}
                      className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      Enviar para aprovação
                    </button>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
