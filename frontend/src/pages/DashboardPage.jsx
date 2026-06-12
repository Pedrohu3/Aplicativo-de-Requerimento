import { Link } from 'react-router-dom'
import { getStoredUser } from '../services/authService'

export default function DashboardPage() {
  const user = getStoredUser()
  const isStaff = ['SECRETARIO', 'COORDENADOR', 'DIRETOR', 'ADMIN'].includes(user?.role)
  const canApprove = user?.role !== 'ALUNO'

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white shadow-lg">
        <p className="text-sm text-primary-100">Sistema de Requerimentos</p>
        <h2 className="mt-1 text-2xl font-bold capitalize">Olá, {user?.name ?? 'usuário'}!</h2>
        <p className="mt-2 max-w-xl text-primary-100">
          Crie requerimentos com formulários personalizados e acompanhe o fluxo de aprovação.
        </p>
        {user?.role && (
          <span className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            Perfil: {user.role}
          </span>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/novo-requerimento"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-800">Novo Requerimento</p>
          <p className="mt-1 text-sm text-slate-500">Preencha um formulário dinâmico e envie para aprovação.</p>
        </Link>

        <Link
          to="/meus-requerimentos"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-800">Meus Requerimentos</p>
          <p className="mt-1 text-sm text-slate-500">Veja rascunhos, status e histórico dos seus pedidos.</p>
        </Link>

        {canApprove && (
          <Link
            to="/aprovacoes"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-800">Fila de Aprovação</p>
            <p className="mt-1 text-sm text-slate-500">Analise requerimentos pendentes do seu perfil.</p>
          </Link>
        )}

        {isStaff && (
          <Link
            to="/tipos-requerimento"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-800">Tipos de Requerimento</p>
            <p className="mt-1 text-sm text-slate-500">
              Defina campos customizados e fluxos de aprovação personalizados.
            </p>
          </Link>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800">Como funciona</h3>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li>1. Um coordenador ou admin cadastra um <strong>tipo de requerimento</strong> com campos e etapas.</li>
          <li>2. O aluno (ou qualquer usuário) preenche o formulário e envia.</li>
          <li>3. O requerimento passa pelas etapas definidas (ex.: Professor → Coordenação → Diretor).</li>
          <li>4. Cada aprovador analisa, aprova ou rejeita com observações.</li>
        </ol>
      </section>
    </div>
  )
}
