import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser, logout } from '../services/authService'
import { listarMeusRequerimentos, listarPendentes } from '../services/requerimentoService'

export default function Navbar({ title, onMenuToggle }) {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  function handleLogout() {
    logout()
    window.location.replace('/login')
  }

  useEffect(() => {
    let active = true

    async function carregarAtualizacoes() {
      try {
        const [meus, pendentes] = await Promise.all([
          listarMeusRequerimentos(),
          listarPendentes().catch(() => []),
        ])
        const mapa = new Map()
        ;[...meus, ...pendentes].forEach((item) => {
          if (!mapa.has(item.id)) mapa.set(item.id, item)
        })

        const todos = Array.from(mapa.values())
        const storageKey = `req-notif-${user?.id ?? user?.email ?? 'visitante'}`
        const salvo = JSON.parse(localStorage.getItem(storageKey) || 'null')

        if (!salvo) {
          localStorage.setItem(storageKey, JSON.stringify({ items: todos }))
          return
        }

        const anterior = new Map((salvo.items || []).map((i) => [i.id, i]))
        const novas = todos
          .filter((item) => {
            const ant = anterior.get(item.id)
            return !ant || ant.status !== item.status || ant.etapaAtualRole !== item.etapaAtualRole
          })
          .map((item) => ({ ...item, tipo: !anterior.has(item.id) ? 'Novo' : 'Atualizado' }))

        if (!active) return
        setNotifications(novas.slice(0, 6))
        setHasUnread(novas.length > 0)
        localStorage.setItem(storageKey, JSON.stringify({ items: todos }))
      } catch {
        /* silencioso */
      }
    }

    carregarAtualizacoes()
    const interval = window.setInterval(carregarAtualizacoes, 15000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [user?.email, user?.id])

  function handleBellClick() {
    setShowNotifications((prev) => !prev)
    setHasUnread(false)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-light bg-white px-4 shadow-sm lg:px-6">
      {/* Esquerda: hamburguer + título */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-mid hover:bg-gray-light lg:hidden"
          aria-label="Abrir menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-800">{title}</h1>
          <p className="hidden text-xs text-gray-mid sm:block">FEMASS — Sistema de Requerimentos</p>
        </div>
      </div>

      {/* Direita: notificações + usuário */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Sino de notificações */}
        <div className="relative">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative rounded-lg p-2 text-gray-mid hover:bg-gray-light hover:text-slate-600"
            aria-label="Notificações"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-gray-light bg-white p-3 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Atualizações</p>
                <span className="text-xs text-gray-mid">Atualiza a cada 15s</span>
              </div>
              {notifications.length === 0 ? (
                <p className="rounded-lg bg-gray-light px-3 py-3 text-sm text-gray-mid">
                  Nenhuma atualização recente.
                </p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/requerimentos/${item.id}`)
                          setShowNotifications(false)
                        }}
                        className="w-full rounded-lg border border-gray-light p-3 text-left transition hover:border-primary-200 hover:bg-primary-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{item.tipoRequerimentoNome}</p>
                          <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                            {item.tipo}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-mid">{item.status}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-gray-light" />

        {/* Avatar + nome + sair */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white uppercase">
            {(user?.name ?? 'U').charAt(0)}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name ?? 'Usuário'}</p>
            <p className="text-xs text-gray-mid leading-tight">{user?.matricula ?? user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="rounded-lg p-2 text-gray-mid hover:bg-gray-light hover:text-red-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
