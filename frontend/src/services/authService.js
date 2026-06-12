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

export async function login(email, password) {
  const token = encodeCredentials(email, password)

  const { data } = await api.get('/me', {
    headers: { Authorization: `Basic ${token}` },
  })

  const user = {
    name: data.name ?? email.split('@')[0],
    email: data.email ?? email,
    role: data.role ?? null,
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))

  return user
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}
