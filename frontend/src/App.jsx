import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AprovacoesPage from './pages/AprovacoesPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MeusRequerimentosPage from './pages/MeusRequerimentosPage'
import RegisterPage from './pages/RegisterPage'
import NovoRequerimentoPage from './pages/NovoRequerimentoPage'
import RequerimentoDetalhePage from './pages/RequerimentoDetalhePage'
import CursosPage from './pages/CursosPage'
import EditarRequerimentoPage from './pages/EditarRequerimentoPage'
import TiposRequerimentoPage from './pages/TiposRequerimentoPage'
import UsuariosPage from './pages/UsuariosPage'
import ComoFuncionaPage from './pages/ComoFuncionaPage'
import { isAuthenticated } from './services/authService'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="novo-requerimento" element={<NovoRequerimentoPage />} />
            <Route path="meus-requerimentos" element={<MeusRequerimentosPage />} />
            <Route path="aprovacoes" element={<AprovacoesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="cursos" element={<CursosPage />} />
            <Route path="tipos-requerimento" element={<TiposRequerimentoPage />} />
            <Route path="requerimentos/:id" element={<RequerimentoDetalhePage />} />
            <Route path="requerimentos/:id/editar" element={<EditarRequerimentoPage />} />
            <Route path="como-funciona" element={<ComoFuncionaPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
