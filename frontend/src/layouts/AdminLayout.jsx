import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const pageTitles = {
  '/': 'Dashboard',
  '/novo-requerimento': 'Novo Requerimento',
  '/meus-requerimentos': 'Meus Requerimentos',
  '/aprovacoes': 'Aprovações',
  '/tipos-requerimento': 'Tipos de Requerimento',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith('/requerimentos/') ? 'Detalhe do Requerimento' : 'Painel')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
