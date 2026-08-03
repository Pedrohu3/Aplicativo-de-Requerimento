import api from './api'

export async function listarDisciplinas(cursoId) {
  const { data } = await api.get('/disciplinas', { params: cursoId ? { cursoId } : {} })
  return data
}

export async function buscarDisciplina(id) {
  const { data } = await api.get(`/disciplinas/${id}`)
  return data
}

export async function criarDisciplina(payload) {
  const { data } = await api.post('/disciplinas', payload)
  return data
}

export async function atualizarDisciplina(id, payload) {
  const { data } = await api.put(`/disciplinas/${id}`, payload)
  return data
}

export async function deletarDisciplina(id) {
  await api.delete(`/disciplinas/${id}`)
}
