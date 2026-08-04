import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getStoredUser, isAdmin } from '../services/authService'
import { listarCursos } from '../services/cursosService'
import {
  atualizarDisciplina,
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from '../services/disciplinasService'
import { listarUsuarios } from '../services/userService'

export default function DisciplinasPage() {
  const user = getStoredUser()
  if (!isAdmin(user)) return <Navigate to="/" replace />

  const [disciplinas, setDisciplinas] = useState([])
  const [cursos, setCursos] = useState([])
  const [professores, setProfessores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoCursoId, setNovoCursoId] = useState('')
  const [novoProfessorId, setNovoProfessorId] = useState('')
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editForm, setEditForm] = useState({ nome: '', cursoId: '', professorId: '' })

  async function load() {
    try {
      setLoading(true)
      const [d, c, u] = await Promise.all([listarDisciplinas(), listarCursos(), listarUsuarios()])
      setDisciplinas(d)
      setCursos(c)
      setProfessores(u.filter((usr) => usr.roles?.includes('PROFESSOR')))
    } catch {
      setError('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCriar(e) {
    e.preventDefault()
    if (!novoNome.trim() || !novoCursoId) return
    try {
      setCriando(true)
      await criarDisciplina({
        nome: novoNome.trim(),
        cursoId: Number(novoCursoId),
        professorId: novoProfessorId ? Number(novoProfessorId) : null,
      })
      setNovoNome('')
      setNovoCursoId('')
      setNovoProfessorId('')
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao criar disciplina.')
    } finally {
      setCriando(false)
    }
  }

  function startEdit(disciplina) {
    setEditandoId(disciplina.id)
    setEditForm({
      nome: disciplina.nome,
      cursoId: disciplina.cursoId,
      professorId: disciplina.professorId ?? '',
    })
  }

  async function handleAtualizar(id) {
    if (!editForm.nome.trim() || !editForm.cursoId) return
    try {
      await atualizarDisciplina(id, {
        nome: editForm.nome.trim(),
        cursoId: Number(editForm.cursoId),
        professorId: editForm.professorId ? Number(editForm.professorId) : null,
      })
      setEditandoId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao atualizar disciplina.')
    }
  }

  async function handleDeletar(id) {
    try {
      await deletarDisciplina(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao excluir disciplina.')
    }
  }

  function nomeCurso(cursoId) {
    return cursos.find((c) => c.id === cursoId)?.nome ?? '—'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Disciplinas</h2>
        <p className="text-sm text-slate-500">
          Cadastre disciplinas por curso e defina o professor responsável por aprovar requerimentos vinculados a elas.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleCriar} className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome da disciplina"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        <select
          value={novoCursoId}
          onChange={(e) => setNovoCursoId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Curso...</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select
          value={novoProfessorId}
          onChange={(e) => setNovoProfessorId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">— sem professor —</option>
          {professores.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={criando || !novoNome.trim() || !novoCursoId}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : disciplinas.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma disciplina cadastrada.</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {disciplinas.map((disciplina) => (
              <li key={disciplina.id} className="p-4">
                {editandoId === disciplina.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editForm.nome}
                      onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                      className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <select
                      value={editForm.cursoId}
                      onChange={(e) => setEditForm({ ...editForm, cursoId: e.target.value })}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    >
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                    <select
                      value={editForm.professorId}
                      onChange={(e) => setEditForm({ ...editForm, professorId: e.target.value })}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    >
                      <option value="">— sem professor —</option>
                      {professores.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAtualizar(disciplina.id)}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoId(null)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{disciplina.nome}</p>
                      <p className="text-sm text-slate-500">
                        Curso: {disciplina.cursoNome ?? nomeCurso(disciplina.cursoId)} · Professor: {disciplina.professorNome ?? '— sem responsável —'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(disciplina)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletar(disciplina.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
