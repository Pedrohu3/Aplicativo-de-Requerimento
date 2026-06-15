import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { getStoredUser } from '../services/authService'
import { listarMeusRequerimentos, listarPendentes } from '../services/requerimentoService'

function StatCard({ label, value, colorBg, colorText, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colorBg}`}>
        <span className={colorText}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function QuickLink({ to, label, sub, icon, accent }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const user = getStoredUser()
  const isStaff = Boolean(user?.role && user.role !== 'ALUNO')
  const firstName = user?.name?.split(' ')[0] ?? 'usuário'

  const [meus, setMeus] = useState([])
  const [pendentes, setPendentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tasks = [listarMeusRequerimentos().then(setMeus).catch(() => {})]
    if (isStaff) tasks.push(listarPendentes().then(setPendentes).catch(() => {}))
    Promise.all(tasks).finally(() => setLoading(false))
  }, [])

  const contadores = {
    total: meus.length,
    emAprovacao: meus.filter((r) => r.status === 'EM_APROVACAO').length,
    aprovado: meus.filter((r) => r.status === 'APROVADO').length,
    rascunho: meus.filter((r) => r.status === 'RASCUNHO').length,
    rejeitado: meus.filter((r) => r.status === 'REJEITADO').length,
  }

  const recentes = [...meus]
    .sort((a, b) => new Date(b.criadoEm ?? 0) - new Date(a.criadoEm ?? 0))
    .slice(0, 5)

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Olá, {firstName}!</h2>
        <p className="text-sm capitalize text-slate-400">{hoje}</p>
      </div>

      {/* Cards de resumo */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total de requerimentos"
            value={contadores.total}
            colorBg="bg-blue-50"
            colorText="text-blue-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            label="Em aprovação"
            value={contadores.emAprovacao}
            colorBg="bg-amber-50"
            colorText="text-amber-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Aprovados"
            value={contadores.aprovado}
            colorBg="bg-emerald-50"
            colorText="text-emerald-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Rascunhos"
            value={contadores.rascunho}
            colorBg="bg-slate-100"
            colorText="text-slate-500"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          {isStaff && (
            <StatCard
              label="Pendentes na minha fila"
              value={pendentes.length}
              colorBg="bg-violet-50"
              colorText="text-violet-600"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
            />
          )}
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requerimentos recentes */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-800">Requerimentos recentes</h3>
            <Link to="/meus-requerimentos" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-slate-400">Carregando...</p>
          ) : recentes.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-400">Você ainda não criou nenhum requerimento.</p>
              <Link
                to="/novo-requerimento"
                className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Criar primeiro requerimento →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentes.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {r.tipoRequerimentoNome}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(r.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {r.status === 'EM_APROVACAO' && r.etapaAtualRole && (
                        <span className="ml-2 text-amber-600">· Aguardando {r.etapaAtualRole}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={r.status} />
                    <Link
                      to={`/requerimentos/${r.id}`}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Ver
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="space-y-3">
          <h3 className="px-1 font-semibold text-slate-800">Ações rápidas</h3>

          <QuickLink
            to="/novo-requerimento"
            label="Novo requerimento"
            sub="Preencher e enviar"
            accent="bg-primary-50 text-primary-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          />

          <QuickLink
            to="/meus-requerimentos"
            label="Meus requerimentos"
            sub="Histórico e rascunhos"
            accent="bg-slate-100 text-slate-500"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          {isStaff && (
            <QuickLink
              to="/aprovacoes"
              label="Fila de aprovações"
              sub={`${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''}`}
              accent="bg-violet-50 text-violet-600"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          )}

          <QuickLink
            to="/como-funciona"
            label="Como funciona"
            sub="Guia do sistema"
            accent="bg-sky-50 text-sky-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
