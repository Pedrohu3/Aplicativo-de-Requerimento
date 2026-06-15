import api from './api'

export async function listarCursos() {
  const { data } = await api.get('/cursos')
  return data
}

export async function criarCurso(nome) {
  const { data } = await api.post('/cursos', { nome })
  return data
}

export async function atualizarCurso(id, nome) {
  const { data } = await api.put(`/cursos/${id}`, { nome })
  return data
}

export async function deletarCurso(id) {
  await api.delete(`/cursos/${id}`)
}

export async function atribuirResponsavel(cursoId, role, userId) {
  const { data } = await api.put(`/cursos/${cursoId}/responsaveis`, { role, userId })
  return data
}

export async function removerResponsavel(cursoId, role) {
  await api.delete(`/cursos/${cursoId}/responsaveis/${role}`)
}
