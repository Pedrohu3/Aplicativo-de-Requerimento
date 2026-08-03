import api from './api'

export async function listarUsuarios() {
  const { data } = await api.get('/users')
  return data
}

export async function criarUsuario(payload) {
  const { data } = await api.post('/users', payload)
  return data
}

export async function atualizarUsuario(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function deletarUsuario(id) {
  await api.delete(`/users/${id}`)
}
