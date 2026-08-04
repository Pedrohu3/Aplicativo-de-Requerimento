import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { criarUsuario } from '../services/userService'
import { listarCursos } from '../services/cursosService'
import { ROLES } from '../services/requerimentoService'
import { getStoredUser, isAdmin } from '../services/authService'

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  matricula: '',
  roles: ['PROFESSOR'],
  cursoId: '',
  admin: false,
}

function toggleRole(roles, role) {
  const has = roles.includes(role)
  if (role === 'ALUNO') {
    return has ? [] : ['ALUNO']
  }
  if (has) {
    return roles.filter((r) => r !== role)
  }
  return [...roles.filter((r) => r !== 'ALUNO'), role]
}

export default function NovoUsuarioPage() {
  const user = getStoredUser()
  if (!isAdmin(user)) return <Navigate to="/" replace />

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
      const isAluno = form.roles.includes('ALUNO')
      await criarUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        matricula: form.matricula || null,
        roles: form.roles,
        cursoId: isAluno && form.cursoId ? Number(form.cursoId) : null,
        admin: !isAluno && form.admin,
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
          {form.roles.includes('ALUNO') && (
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
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Roles (acumuláveis, exceto Aluno)</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={form.roles.includes(role)}
                  onChange={() => {
                    const roles = toggleRole(form.roles, role)
                    const isAluno = roles.includes('ALUNO')
                    setForm({ ...form, roles, cursoId: isAluno ? form.cursoId : '', admin: isAluno ? false : form.admin })
                  }}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.admin}
            disabled={form.roles.includes('ALUNO')}
            onChange={(e) => setForm({ ...form, admin: e.target.checked })}
          />
          Conceder permissões de administrador
        </label>

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
