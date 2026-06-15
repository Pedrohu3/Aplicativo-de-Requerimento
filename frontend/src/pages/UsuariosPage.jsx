import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { listarUsuarios, atualizarUsuario } from '../services/userService'
import { listarCursos } from '../services/cursosService'
import { ROLES } from '../services/requerimentoService'
import { getStoredUser } from '../services/authService'

export default function UsuariosPage() {
  const user = getStoredUser()
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />

  const [items, setItems] = useState([])
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const [usuarios, listaCursos] = await Promise.all([listarUsuarios(), listarCursos()])
      setItems(usuarios)
      setCursos(listaCursos)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleChange(id, patch) {
    const current = items.find((item) => item.id === id)
    try {
      setSavingId(id)
      await atualizarUsuario(id, {
        nome: current?.nome ?? '',
        email: current?.email ?? '',
        role: current?.role ?? 'ALUNO',
        cursoId: current?.cursoId ?? null,
        ...patch,
      })
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao atualizar usuário.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Usuários do sistema</h2>
        <p className="text-sm text-slate-500">Defina as roles e cursos de cada usuário no sistema.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Carregando usuários...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Role atual</th>
                  <th className="px-4 py-3 font-semibold">Alterar role</th>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3 text-slate-700">{item.role}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.role}
                        disabled={savingId === item.id}
                        onChange={(e) => handleChange(item.id, { role: e.target.value, cursoId: e.target.value !== 'ALUNO' ? null : item.cursoId })}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {item.role === 'ALUNO' ? (
                        <select
                          value={item.cursoId ?? ''}
                          disabled={savingId === item.id}
                          onChange={(e) => handleChange(item.id, { cursoId: e.target.value ? Number(e.target.value) : null })}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="">— sem curso —</option>
                          {cursos.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
