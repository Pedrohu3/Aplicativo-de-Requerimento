import api from './api'

export async function listarTiposAtivos() {
  const { data } = await api.get('/tipos-requerimento')
  return data
}

export async function listarTiposTodos() {
  const { data } = await api.get('/tipos-requerimento/todos')
  return data
}

export async function buscarTipo(id) {
  const { data } = await api.get(`/tipos-requerimento/${id}`)
  return data
}

export async function criarTipo(payload) {
  const { data } = await api.post('/tipos-requerimento', payload)
  return data
}

export async function atualizarTipo(id, payload) {
  const { data } = await api.put(`/tipos-requerimento/${id}`, payload)
  return data
}

export async function desativarTipo(id) {
  await api.delete(`/tipos-requerimento/${id}`)
}

export async function listarMeusRequerimentos() {
  const { data } = await api.get('/requerimentos/meus')
  return data
}

export async function listarPendentes() {
  const { data } = await api.get('/requerimentos/pendentes')
  return data
}

export async function buscarRequerimento(id) {
  const { data } = await api.get(`/requerimentos/${id}`)
  return data
}

export async function criarRequerimento(payload) {
  const { data } = await api.post('/requerimentos', payload)
  return data
}

export async function enviarRequerimento(id) {
  const { data } = await api.post(`/requerimentos/${id}/enviar`)
  return data
}

export async function aprovarRequerimento(id, payload) {
  const { data } = await api.post(`/requerimentos/${id}/aprovar`, payload)
  return data
}

export async function cancelarRequerimento(id) {
  const { data } = await api.post(`/requerimentos/${id}/cancelar`)
  return data
}

export async function atualizarRequerimento(id, payload) {
  const { data } = await api.put(`/requerimentos/${id}`, payload)
  return data
}

export const CAMPO_TIPOS = [
  { value: 'TEXTO', label: 'Texto curto' },
  { value: 'TEXTO_LONGO', label: 'Texto longo' },
  { value: 'SELECAO', label: 'Lista (select)' },
  { value: 'OPCAO_UNICA', label: 'Opção única (radio)' },
  { value: 'CHECKBOX', label: 'Múltipla escolha (checkbox)' },
  { value: 'DATA', label: 'Data' },
  { value: 'NUMERO', label: 'Número' },
  { value: 'ANEXO', label: 'Anexo (arquivo)' },
]

export const ROLES = [
  'ALUNO',
  'PROFESSOR',
  'SECRETARIO',
  'COORDENADOR',
  'DIRETOR',
  'ADMIN',
]

export const STATUS_LABELS = {
  RASCUNHO: 'Rascunho',
  EM_APROVACAO: 'Em aprovação',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado',
}

export const ESCOPOS_REQUERIMENTO = [
  { value: 'DISCIPLINA', label: 'Disciplina', descricao: 'Exige uma etapa PROFESSOR; o aluno escolhe a disciplina, que define o professor aprovador (ex.: abono de faltas).' },
  { value: 'CURSO', label: 'Curso', descricao: 'Aprovação via responsáveis do curso do solicitante (ex.: validação de atividades complementares).' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo', descricao: 'Sem curso ou disciplina; aprovado por quem tiver a role da etapa, em qualquer curso (ex.: acerto de ponto).' },
]

export const MOTIVOS_REJEICAO = [
  { value: 'DOCUMENTACAO_INCOMPLETA', label: 'Documentação incompleta' },
  { value: 'DADOS_INCONSISTENTES', label: 'Dados inconsistentes' },
  { value: 'NAO_ATENDE_CRITERIOS', label: 'Não atende aos critérios' },
  { value: 'FORA_DO_PRAZO', label: 'Fora do prazo' },
  { value: 'DUPLICADO', label: 'Requerimento duplicado' },
  { value: 'OUTRO', label: 'Outro' },
]

export const STATUS_COLORS = {
  RASCUNHO: 'border-slate-200 bg-slate-100 text-slate-700',
  EM_APROVACAO: 'border-amber-200 bg-amber-100 text-amber-800',
  APROVADO: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  REJEITADO: 'border-red-200 bg-red-100 text-red-800',
  CANCELADO: 'border-gray-200 bg-gray-100 text-gray-600',
}
