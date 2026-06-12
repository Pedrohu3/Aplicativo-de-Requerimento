export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold">
            DS
          </div>
          <span className="text-lg font-semibold">Desenv Sistemas</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Gerencie seu sistema com eficiência
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Painel administrativo moderno para monitorar dados, usuários e operações em um só lugar.
          </p>
        </div>

        <p className="text-sm text-slate-500">© 2026 Desenv Sistemas — FEMASS</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
