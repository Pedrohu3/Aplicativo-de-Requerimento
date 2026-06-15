import api from './api'

export async function listarUsuarios() {
  const { data } = await api.get('/users')
  return data
}

export async function atualizarUsuario(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}
