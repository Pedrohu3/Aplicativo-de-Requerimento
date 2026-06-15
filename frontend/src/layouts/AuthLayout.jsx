import logo from '../assets/logo.jpg'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#E6E8E9]">
      {/* Painel esquerdo */}
      <div className="hidden w-[420px] shrink-0 flex-col border-r border-[#E6E8E9] bg-white lg:flex">
        {/* Logo */}
        <div className="flex flex-col items-center border-b border-[#E6E8E9] px-8 py-8">
          <img src={logo} alt="FEMASS" className="mx-auto h-32 w-auto object-contain" />
        </div>

        {/* Descrição */}
        <div className="flex flex-1 flex-col justify-center px-8 py-6">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBF4FF]">
            <svg className="h-6 w-6" style={{ color: '#0E63B3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold leading-snug" style={{ color: '#16508A' }}>
            Sistema de Requerimentos
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#A9AFB4' }}>
            Solicite requerimentos acadêmicos com formulários dinâmicos e acompanhe o fluxo de aprovação em tempo real.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              'Formulários personalizados por tipo de requerimento',
              'Fluxo de aprovação por perfil e curso',
              'Notificações automáticas por e-mail',
              'Histórico completo de aprovações',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#16508A' }}>
                <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#0E63B3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="border-t border-[#E6E8E9] px-8 py-4 text-xs" style={{ color: '#A9AFB4' }}>
          © {new Date().getFullYear()} FEMASS — Sistema de Requerimentos
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-6 flex justify-center lg:hidden">
          <img src={logo} alt="FEMASS" className="h-16 w-auto object-contain" />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
