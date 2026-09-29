import { createContext, useContext, useEffect, useState } from 'react'
import * as accounts from '../services/accounts'
import api from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'e-biblio-token'
const USER_KEY = 'e-biblio-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  function persist(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setUser(user)
  }

  async function login(credentials) {
    const { data } = await accounts.login(credentials)
    persist(data.token, data.user)
    return data.user
  }

  async function register(payload) {
    await accounts.register(payload)
    // L'inscription ne renvoie pas de jeton : on connecte immédiatement
    // avec les identifiants saisis pour amener l'utilisateur sur la page
    // "compte en attente" déjà authentifié (comme le montre la maquette).
    // Un enseignant peut ne pas avoir de matricule (voir RegisterRequest) —
    // on retombe alors sur l'e-mail, que /login accepte aussi.
    return login({
      identifier: payload.registration_number || payload.email,
      password: payload.password,
    })
  }

  function logout() {
    // Révoque le jeton côté serveur (au lieu de simplement l'oublier
    // localement) — capturé avant suppression, sinon l'intercepteur de
    // `api` (qui lit localStorage) ne le trouverait plus au moment où la
    // requête part réellement (ordre des microtasks).
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  async function refreshUser() {
    const { data } = await api.get('/me')
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.')
  }
  return context
}
