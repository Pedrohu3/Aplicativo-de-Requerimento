import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { criarUsuario } from '../services/userService'
import { listarCursos } from '../services/cursosService'
import { ROLES } from '../services/requerimentoService'
import { getStoredUser } from '../services/authService'

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  matricula: '',
  role: 'PROFESSOR',
  cursoId: '',
  admin: false,
}

export default function NovoUsuarioPage() {
  const user = getStoredUser()
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />

  const navigate = useNavigate()
  const [cursos, setCursos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listarCursos().then(setCursos).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await criarUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        matricula: form.matricula || null,
        role: form.role,
        cursoId: form.role === 'ALUNO' && form.cursoId ? Number(form.cursoId) : null,
        admin: form.role !== 'ALUNO' ? form.admin : false,
      })
      navigate('/usuarios')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao criar usuário.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="w-full space-y-6 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Novo usuário</h2>
          <p className="text-sm text-slate-500">
            Crie usuários internos (professores, secretários, coordenadores, diretores) sem vínculo obrigatório
            com um curso. Para associar um professor a cursos ou disciplinas, use as telas de{' '}
            <strong>Cursos</strong> e <strong>Disciplinas</strong> depois de criá-lo aqui — um mesmo professor
            pode ser vinculado a vários cursos e várias disciplinas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/usuarios')}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <input
            required
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Senha (mínimo 6 caracteres)"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />
          <input
            placeholder="Matrícula (opcional)"
            value={form.matricula}
            onChange={(e) => setForm({ ...form, matricula: e.target.value })}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value, cursoId: '', admin: false })}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {form.role === 'ALUNO' ? (
            <select
              value={form.cursoId}
              onChange={(e) => setForm({ ...form, cursoId: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            >
              <option value="">— sem curso —</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          ) : (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.admin}
                onChange={(e) => setForm({ ...form, admin: e.target.checked })}
              />
              Conceder permissões de administrador
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {creating ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>
    </div>
  )
}
