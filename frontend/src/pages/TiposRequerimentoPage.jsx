import { useEffect, useState } from 'react'
import {
  CAMPO_TIPOS,
  ROLES,
  atualizarTipo,
  criarTipo,
  listarTiposTodos,
} from '../services/requerimentoService'

const emptyCampo = (ordem) => ({
  tipo: 'TEXTO',
  label: '',
  placeholder: '',
  opcoes: [],
  opcoesTexto: '',
  obrigatorio: true,
  ordem,
})

const emptyEtapa = (ordem) => ({
  ordem,
  role: 'COORDENADOR',
  descricao: '',
})

const emptyForm = {
  nome: '',
  descricao: '',
  campos: [emptyCampo(0)],
  etapas: [emptyEtapa(0)],
}

export default function TiposRequerimentoPage() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  async function loadTipos() {
    try {
      setLoading(true)
      setTipos(await listarTiposTodos())
    } catch {
      setError('Não foi possível carregar os tipos de requerimento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTipos()
  }, [])

  function startEdit(tipo) {
    setEditingId(tipo.id)
    setForm({
      nome: tipo.nome,
      descricao: tipo.descricao ?? '',
      campos: tipo.campos.filter((c) => !c.fixo).map((c, i) => ({
        tipo: c.tipo,
        label: c.label,
        placeholder: c.placeholder ?? '',
        opcoes: c.opcoes ?? [],
        opcoesTexto: (c.opcoes ?? []).join(', '),
        obrigatorio: c.obrigatorio,
        ordem: i,
      })),
      etapas: tipo.etapas.map((e) => ({
        ordem: e.ordem,
        role: e.role,
        descricao: e.descricao ?? '',
      })),
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  function updateCampo(index, field, value) {
    const campos = [...form.campos]
    campos[index] = { ...campos[index], [field]: value }
    setForm({ ...form, campos })
  }

  function updateEtapa(index, field, value) {
    const etapas = [...form.etapas]
    etapas[index] = { ...etapas[index], [field]: value }
    setForm({ ...form, etapas })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        campos: form.campos.map((campo, index) => ({
          tipo: campo.tipo,
          label: campo.label,
          placeholder: campo.placeholder,
          obrigatorio: campo.obrigatorio,
          ordem: index,
          opcoes: ['SELECAO', 'OPCAO_UNICA', 'CHECKBOX'].includes(campo.tipo)
            ? campo.opcoesTexto.split(',').map((o) => o.trim()).filter(Boolean)
            : [],
        })),
        etapas: form.etapas.map((etapa, index) => ({
          ordem: index,
          role: etapa.role,
          descricao: etapa.descricao,
        })),
      }

      if (editingId) {
        await atualizarTipo(editingId, payload)
      } else {
        await criarTipo(payload)
      }
      cancelForm()
      await loadTipos()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao salvar tipo de requerimento.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tipos de Requerimento</h2>
          <p className="text-sm text-slate-500">
            Defina formulários dinâmicos e fluxos de aprovação personalizados.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Novo tipo
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {editingId ? 'Editar tipo de requerimento' : 'Novo tipo de requerimento'}
            </h3>
            <button type="button" onClick={cancelForm} className="text-sm text-slate-500 hover:text-slate-700">
              Cancelar
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrição</label>
              <input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <section>
            <h3 className="mb-3 font-semibold text-slate-800">Campos fixos (preenchidos automaticamente)</h3>
            <div className="space-y-4">
              {[
                { label: 'Nome', placeholder: 'Preenchido com o nome do solicitante' },
                { label: 'Matrícula', placeholder: 'Preenchido com a matrícula do solicitante' },
                { label: 'Curso', placeholder: 'Preenchido com o curso do solicitante' },
              ].map(({ label, placeholder }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <input
                      readOnly
                      value={label}
                      className="cursor-default rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500"
                    />
                    <input
                      readOnly
                      value="Texto curto"
                      className="cursor-default rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400"
                    />
                    <input
                      readOnly
                      value={placeholder}
                      className="cursor-default rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400"
                    />
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Campo fixo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Campos do formulário</h3>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    campos: [...form.campos, emptyCampo(form.campos.length)],
                  })
                }
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                + Adicionar campo
              </button>
            </div>
            <div className="space-y-4">
              {form.campos.map((campo, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <input
                      required
                      placeholder="Label do campo"
                      value={campo.label}
                      onChange={(e) => updateCampo(index, 'label', e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <select
                      value={campo.tipo}
                      onChange={(e) => updateCampo(index, 'tipo', e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {CAMPO_TIPOS.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Placeholder"
                      value={campo.placeholder}
                      onChange={(e) => updateCampo(index, 'placeholder', e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={campo.obrigatorio}
                        onChange={(e) => updateCampo(index, 'obrigatorio', e.target.checked)}
                      />
                      Obrigatório
                    </label>
                  </div>
                  {['SELECAO', 'OPCAO_UNICA', 'CHECKBOX'].includes(campo.tipo) && (
                    <input
                      required
                      placeholder="Opções separadas por vírgula"
                      value={campo.opcoesTexto}
                      onChange={(e) => updateCampo(index, 'opcoesTexto', e.target.value)}
                      className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Fluxo de aprovação</h3>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    etapas: [...form.etapas, emptyEtapa(form.etapas.length)],
                  })
                }
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                + Adicionar etapa
              </button>
            </div>
            <div className="space-y-3">
              {form.etapas.map((etapa, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                    Etapa {index + 1}
                  </span>
                  <select
                    value={etapa.role}
                    onChange={(e) => updateEtapa(index, 'role', e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {ROLES.filter((r) => r !== 'ALUNO').map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Descrição da etapa (opcional)"
                    value={etapa.descricao}
                    onChange={(e) => updateEtapa(index, 'descricao', e.target.value)}
                    className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar tipo de requerimento'}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Carregando...</p>
        ) : tipos.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Nenhum tipo cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tipos.map((tipo) => (
              <li key={tipo.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-slate-800">{tipo.nome}</p>
                  <p className="text-sm text-slate-500">{tipo.descricao}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {tipo.campos.length} campos · {tipo.etapas.length} etapas · por {tipo.criadorNome}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {tipo.etapas.map((etapa) => (
                    <span
                      key={etapa.id}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {etapa.ordem + 1}. {etapa.role}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => startEdit(tipo)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
