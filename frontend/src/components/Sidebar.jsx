import { NavLink } from 'react-router-dom'
import { getStoredUser } from '../services/authService'
import logo from '../assets/logo.jpg'

const iconClass = 'h-5 w-5 shrink-0'

const menuItems = [
  {
    label: 'Início',
    to: '/',
    roles: null,
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Novo Requerimento',
    to: '/novo-requerimento',
    roles: null,
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: 'Meus Requerimentos',
    to: '/meus-requerimentos',
    roles: null,
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Aprovações',
    to: '/aprovacoes',
    roles: ['PROFESSOR', 'SECRETARIO', 'COORDENADOR', 'DIRETOR', 'ADMIN'],
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Tipos de Requerimento',
    to: '/tipos-requerimento',
    roles: ['SECRETARIO', 'COORDENADOR', 'DIRETOR', 'ADMIN'],
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: 'Usuários',
    to: '/usuarios',
    roles: ['ADMIN'],
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
      </svg>
    ),
  },
  {
    label: 'Cursos',
    to: '/cursos',
    roles: ['ADMIN'],
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-3.5 2M12 20l3.5-2" />
      </svg>
    ),
  },
  {
    label: 'Como Funciona',
    to: '/como-funciona',
    roles: null,
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const user = getStoredUser()
  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  )

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E6E8E9] bg-white shadow-sm transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center border-b border-[#E6E8E9] px-4 py-4">
          <img src={logo} alt="FEMASS" className="mx-auto h-20 w-auto object-contain" />
          <p className="mt-1 text-[11px] font-medium text-[#A9AFB4]">Sistema de Requerimentos</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#A9AFB4' }}>
            Menu
          </p>
          <ul className="space-y-0.5">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? '' : 'hover:bg-[#EBF4FF]'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? '#0E63B3' : undefined,
                    color: isActive ? '#ffffff' : '#16508A',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ color: isActive ? '#ffffff' : '#0E63B3' }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé — usuário logado */}
        <div className="border-t border-[#E6E8E9] p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase"
              style={{ backgroundColor: '#EBF4FF', color: '#0E63B3' }}
            >
              {(user?.name ?? 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: '#16508A' }}>{user?.name ?? 'Usuário'}</p>
              <p className="truncate text-xs" style={{ color: '#A9AFB4' }}>{user?.role ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
