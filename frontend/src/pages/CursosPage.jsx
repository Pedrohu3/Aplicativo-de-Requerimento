import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../services/authService'
import { listarCursos, criarCurso, atualizarCurso, deletarCurso, atribuirResponsavel, removerResponsavel } from '../services/cursosService'
import { listarUsuarios } from '../services/userService'

const APPROVER_ROLES = ['PROFESSOR', 'SECRETARIO', 'COORDENADOR', 'DIRETOR']

export default function CursosPage() {
  const user = getStoredUser()
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />

  const [cursos, setCursos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')

  async function load() {
    try {
      setLoading(true)
      const [c, u] = await Promise.all([listarCursos(), listarUsuarios()])
      setCursos(c)
      setUsuarios(u)
    } catch {
      setError('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCriar(e) {
    e.preventDefault()
    if (!novoNome.trim()) return
    try {
      setCriando(true)
      await criarCurso(novoNome.trim())
      setNovoNome('')
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao criar curso.')
    } finally {
      setCriando(false)
    }
  }

  async function handleAtualizar(id) {
    if (!editandoNome.trim()) return
    try {
      await atualizarCurso(id, editandoNome.trim())
      setEditandoId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao atualizar curso.')
    }
  }

  async function handleDeletar(id) {
    try {
      await deletarCurso(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao excluir curso.')
    }
  }

  async function handleAtribuir(cursoId, role, userId) {
    try {
      if (!userId) {
        await removerResponsavel(cursoId, role)
      } else {
        await atribuirResponsavel(cursoId, role, Number(userId))
      }
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao atualizar responsável.')
    }
  }

  function usuariosPorRole(role) {
    return usuarios.filter((u) => u.role === role)
  }

  function responsavelAtual(curso, role) {
    return curso.responsaveis?.find((r) => r.role === role)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Cursos</h2>
        <p className="text-sm text-slate-500">Gerencie os cursos e seus responsáveis por etapa de aprovação.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleCriar} className="flex gap-2">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do novo curso"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={criando || !novoNome.trim()}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : cursos.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum curso cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {cursos.map((curso) => (
            <div key={curso.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                {editandoId === curso.id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAtualizar(curso.id)}
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
                  <>
                    <h3 className="font-semibold text-slate-800">{curso.nome}</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditandoId(curso.id); setEditandoNome(curso.nome) }}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Renomear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletar(curso.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {APPROVER_ROLES.map((role) => {
                  const atual = responsavelAtual(curso, role)
                  const opcoes = usuariosPorRole(role)
                  return (
                    <div key={role} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{role}</p>
                      <select
                        value={atual?.userId ?? ''}
                        onChange={(e) => handleAtribuir(curso.id, role, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="">— sem responsável —</option>
                        {opcoes.map((u) => (
                          <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
