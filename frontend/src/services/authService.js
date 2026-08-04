import api from './api'

const AUTH_USER_KEY = 'user'
const AUTH_TOKEN_KEY = 'token'

function encodeCredentials(email, password) {
  return btoa(`${email}:${password}`)
}

export function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
}

// Admin "lógico": vale tanto para quem tem a role ADMIN quanto para quem
// recebeu a flag admin combinada com outra role (ex.: professor + admin).
export function isAdmin(user) {
  return Boolean(user?.admin) || Boolean(user?.roles?.includes('ADMIN'))
}

export function hasAnyRole(user, roles) {
  if (!roles || roles.length === 0) return true
  return roles.some((r) => (r === 'ADMIN' ? isAdmin(user) : Boolean(user?.roles?.includes(r))))
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, senha: password })

  const user = {
    name: data.user?.nome ?? email.split('@')[0],
    matricula: data.user?.matricula ?? null,
    email: data.user?.email ?? email,
    roles: data.user?.roles ?? [],
    admin: data.user?.admin ?? false,
    cursoId: data.user?.cursoId ?? null,
    cursoNome: data.user?.cursoNome ?? null,
  }

  localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))

  return user
}

export async function register(nome, matricula, email, password, cursoId) {
  const { data } = await api.post('/auth/register', {
    nome,
    matricula,
    email,
    senha: password,
    roles: ['ALUNO'],
    cursoId: cursoId || null,
  })

  const user = {
    name: data.user?.nome ?? nome,
    matricula: data.user?.matricula ?? matricula,
    email: data.user?.email ?? email,
    roles: data.user?.roles ?? ['ALUNO'],
    admin: data.user?.admin ?? false,
    cursoId: data.user?.cursoId ?? cursoId ?? null,
    cursoNome: data.user?.cursoNome ?? null,
  }

  localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))

  return user
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}
