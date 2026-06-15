import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import { register } from '../services/authService'
import { listarCursos } from '../services/cursosService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', matricula: '', email: '', password: '', cursoId: '' })
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listarCursos().then(setCursos).catch(() => {})
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.nome, form.matricula, form.email, form.password, form.cursoId || null)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-[#E6E8E9] bg-white p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
          <p className="mt-1 text-sm text-[#A9AFB4]">Preencha seus dados para acessar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-slate-700">Nome completo</label>
            <input id="nome" name="nome" type="text" required value={form.nome} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label htmlFor="matricula" className="mb-1.5 block text-sm font-medium text-slate-700">Matrícula</label>
            <input id="matricula" name="matricula" type="text" required value={form.matricula} onChange={handleChange} className={inputClass} placeholder="Ex: 2024001234" />
          </div>

          <div>
            <label htmlFor="cursoId" className="mb-1.5 block text-sm font-medium text-slate-700">Curso</label>
            <select id="cursoId" name="cursoId" required value={form.cursoId} onChange={handleChange} className={inputClass}>
              <option value="">Selecione seu curso...</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">E-mail institucional</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
            <input id="password" name="password" type="password" required minLength="6" value={form.password} onChange={handleChange} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Entrar</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
