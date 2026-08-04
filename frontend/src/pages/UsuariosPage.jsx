import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import { listarUsuarios, atualizarUsuario, deletarUsuario } from '../services/userService'
import { ROLES } from '../services/requerimentoService'
import { getStoredUser, isAdmin } from '../services/authService'

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

// Renderizado via portal com posição fixa: a tabela tem overflow-x-auto, que
// clipa qualquer filho absolutamente posicionado que tente estourar a caixa
// (o painel "cresce para dentro" do wrapper em vez de flutuar por cima).
function RolesDropdown({ roles, disabled, onToggle }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e) {
      if (buttonRef.current?.contains(e.target) || e.target.closest('[data-roles-panel]')) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  function handleToggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen((prev) => !prev)
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={handleToggleOpen}
        className="flex w-48 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none disabled:opacity-50"
      >
        <span className="truncate">{roles.length ? roles.join(', ') : '— sem role —'}</span>
        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && coords && createPortal(
        <div
          data-roles-panel
          className="fixed z-50 space-y-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
          style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
        >
          {ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-600">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                disabled={disabled}
                onChange={() => onToggle(role)}
              />
              {role}
            </label>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

export default function UsuariosPage() {
  const user = getStoredUser()
  if (!isAdmin(user)) return <Navigate to="/" replace />

  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      setItems(await listarUsuarios())
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
        roles: current?.roles ?? ['ALUNO'],
        admin: current?.admin ?? false,
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

  function handleToggleRole(item, role) {
    const roles = toggleRole(item.roles ?? [], role)
    const isAluno = roles.includes('ALUNO')
    handleChange(item.id, {
      roles,
      admin: isAluno ? false : item.admin,
      cursoId: isAluno ? item.cursoId : null,
    })
  }

  function handleToggleAdmin(item) {
    handleChange(item.id, { admin: !item.admin })
  }

  async function handleExcluir(id) {
    try {
      setSavingId(id)
      await deletarUsuario(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao excluir usuário.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Usuários do sistema</h2>
          <p className="text-sm text-slate-500">Defina as roles de cada usuário no sistema.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/usuarios/novo')}
          className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Novo usuário
        </button>
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
                  <th className="px-4 py-3 font-semibold">Roles</th>
                  <th className="px-4 py-3 font-semibold">Admin</th>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const roles = item.roles ?? []
                  const isAluno = roles.includes('ALUNO')
                  const cursoTexto = isAluno
                    ? item.cursoNome ?? '—'
                    : item.cursosVinculados?.length ? item.cursosVinculados.join(', ') : '—'
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.nome}</td>
                      <td className="px-4 py-3 text-slate-600">{item.email}</td>
                      <td className="px-4 py-3">
                        <RolesDropdown
                          roles={roles}
                          disabled={savingId === item.id}
                          onToggle={(role) => handleToggleRole(item, role)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={Boolean(item.admin)}
                          disabled={savingId === item.id || isAluno}
                          onChange={() => handleToggleAdmin(item)}
                          title={isAluno ? 'Usuários com a role ALUNO não podem ser administradores' : 'Conceder permissões de administrador'}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cursoTexto}</td>
                      <td className="px-4 py-3">
                        {item.email === user?.email ? (
                          <span className="text-xs text-slate-400">você</span>
                        ) : (
                          <button
                            type="button"
                            disabled={savingId === item.id}
                            onClick={() => handleExcluir(item.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
