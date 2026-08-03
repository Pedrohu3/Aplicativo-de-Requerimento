import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const pageTitles = {
  '/': 'Início',
  '/novo-requerimento': 'Novo Requerimento',
  '/meus-requerimentos': 'Meus Requerimentos',
  '/aprovacoes': 'Aprovações',
  '/usuarios': 'Usuários',
  '/usuarios/novo': 'Novo Usuário',
  '/cursos': 'Cursos',
  '/disciplinas': 'Disciplinas',
  '/tipos-requerimento': 'Tipos de Requerimento',
  '/como-funciona': 'Como Funciona',
}

function resolveTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/requerimentos/') && pathname.endsWith('/editar')) return 'Editar Requerimento'
  if (pathname.startsWith('/requerimentos/')) return 'Detalhes do Requerimento'
  return 'Sistema de Requerimentos'
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = resolveTitle(location.pathname)

  return (
    <div className="flex min-h-screen bg-gray-light">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        <footer className="px-6 py-3 text-center text-xs text-gray-mid">
          © {new Date().getFullYear()} FEMASS — Sistema de Requerimentos
        </footer>
      </div>
    </div>
  )
}
