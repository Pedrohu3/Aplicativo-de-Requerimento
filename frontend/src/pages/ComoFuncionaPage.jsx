import { getStoredUser } from '../services/authService'

const PASSOS = [
  {
    numero: '01',
    titulo: 'Tipo de requerimento é criado',
    descricao:
      'Um administrador, coordenador ou secretário define um tipo de requerimento: quais campos o formulário vai ter (texto, data, anexos…) e quais perfis precisam aprovar, em que ordem.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    numero: '02',
    titulo: 'Aluno preenche e envia',
    descricao:
      'O aluno acessa "Novo Requerimento", escolhe o tipo desejado, preenche o formulário (seus dados de nome, matrícula e curso já vêm preenchidos) e envia para aprovação.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    numero: '03',
    titulo: 'Fluxo de aprovação',
    descricao:
      'O requerimento percorre as etapas definidas — por exemplo, Professor → Coordenador → Diretor. Cada aprovador analisa, pode adicionar uma observação, e aprova ou rejeita.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    numero: '04',
    titulo: 'Resultado final',
    descricao:
      'Ao final do fluxo, o requerimento fica com status Aprovado ou Rejeitado. O aluno e o último aprovador recebem um e-mail automático com o resultado.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const PERFIS = [
  {
    role: 'ALUNO',
    titulo: 'Aluno',
    cor: 'border-blue-200 bg-blue-50',
    corIcone: 'bg-blue-100 text-blue-600',
    acoes: [
      'Criar e enviar requerimentos',
      'Salvar rascunhos para envio posterior',
      'Acompanhar o status e histórico de aprovações',
      'Cancelar requerimentos ainda não finalizados',
    ],
  },
  {
    role: 'PROFESSOR',
    titulo: 'Professor',
    cor: 'border-amber-200 bg-amber-50',
    corIcone: 'bg-amber-100 text-amber-600',
    acoes: [
      'Ver a fila de requerimentos pendentes da sua etapa',
      'Aprovar ou rejeitar com observação',
      'Consultar histórico completo de cada requerimento',
    ],
  },
  {
    role: 'COORDENADOR',
    titulo: 'Coordenador / Secretário / Diretor',
    cor: 'border-violet-200 bg-violet-50',
    corIcone: 'bg-violet-100 text-violet-600',
    acoes: [
      'Mesmas permissões de aprovação do Professor',
      'Criar e editar tipos de requerimento',
      'Definir campos e etapas de aprovação',
    ],
  },
  {
    role: 'ADMIN',
    titulo: 'Administrador',
    cor: 'border-slate-200 bg-slate-50',
    corIcone: 'bg-slate-100 text-slate-600',
    acoes: [
      'Acesso completo ao sistema',
      'Gerenciar usuários, cursos e disciplinas',
      'Atribuir responsáveis (coordenador, secretário, diretor) a cada curso',
      'Atribuir o professor responsável por cada disciplina',
      'Editar qualquer requerimento',
    ],
  },
]

const DICAS = [
  {
    titulo: 'Rascunho',
    texto: 'Você pode salvar um requerimento como rascunho e enviá-lo depois. Enquanto for rascunho, nenhum aprovador o vê.',
  },
  {
    titulo: 'Campos automáticos',
    texto: 'Nome, Matrícula e Curso já vêm preenchidos com os seus dados de cadastro — você não precisa digitar.',
  },
  {
    titulo: 'E-mails automáticos',
    texto: 'Ao enviar, você recebe uma confirmação. Ao final, recebe o resultado. Os aprovadores também são notificados quando um requerimento chega na fila deles.',
  },
  {
    titulo: 'Aprovação por curso',
    texto: 'Etapas de Secretário, Coordenador e Diretor vão para os responsáveis designados ao seu curso. Se você mudou de curso, entre em contato com a secretaria.',
  },
  {
    titulo: 'Aprovação por disciplina',
    texto: 'A etapa de Professor é sempre resolvida pela disciplina escolhida ao criar o requerimento — cada disciplina tem um professor responsável específico.',
  },
]

export default function ComoFuncionaPage() {
  const user = getStoredUser()

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Como funciona</h2>
        <p className="mt-1 text-sm text-slate-500">
          Entenda o fluxo completo do Sistema de Requerimentos da FEMASS.
        </p>
      </div>

      {/* Fluxo em etapas */}
      <section>
        <h3 className="mb-5 text-base font-semibold text-slate-700">Fluxo de um requerimento</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl font-black text-slate-100">{passo.numero}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  {passo.icon}
                </div>
              </div>
              <p className="mb-1 text-sm font-semibold text-slate-800">{passo.titulo}</p>
              <p className="text-sm leading-relaxed text-slate-500">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perfis */}
      <section>
        <h3 className="mb-5 text-base font-semibold text-slate-700">O que cada perfil pode fazer</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {PERFIS.map((perfil) => (
            <div
              key={perfil.role}
              className={`rounded-xl border p-5 ${perfil.cor} ${
                user?.roles?.includes(perfil.role) ? 'ring-2 ring-primary-400' : ''
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${perfil.corIcone}`}>
                  {perfil.titulo.charAt(0)}
                </div>
                <p className="font-semibold text-slate-800">
                  {perfil.titulo}
                  {user?.roles?.includes(perfil.role) && (
                    <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      Você
                    </span>
                  )}
                </p>
              </div>
              <ul className="space-y-1.5">
                {perfil.acoes.map((acao) => (
                  <li key={acao} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {acao}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Dicas */}
      <section>
        <h3 className="mb-5 text-base font-semibold text-slate-700">Dicas úteis</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {DICAS.map((dica) => (
            <div key={dica.titulo} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100">
                <svg className="h-3.5 w-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{dica.titulo}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{dica.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
