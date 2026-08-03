import api from './api'

export async function uploadAnexo(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/anexos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
