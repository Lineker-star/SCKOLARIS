import { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from '../utils/secureStorage'
import * as accounts from '../services/accounts'
import api from '../services/api'
import { onUnauthorized } from '../utils/authEvents'

const AuthContext = createContext(null)

const TOKEN_KEY = 'e-biblio-token'
const USER_KEY = 'e-biblio-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ])
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    // Jeton expiré (1 jour) ou révoqué → déconnexion forcée côté app,
    // quel que soit le rôle. Nettoyage local direct, sans rappeler
    // /logout : le jeton n'est déjà plus valide côté serveur.
    return onUnauthorized(() => {
      SecureStore.deleteItemAsync(TOKEN_KEY)
      SecureStore.deleteItemAsync(USER_KEY)
      setUser(null)
    })
  }, [])

  async function persist(token, user) {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    setUser(user)
  }

  async function login(credentials) {
    const { data } = await accounts.login(credentials)
    await persist(data.token, data.user)
    return data.user
  }

  async function register(payload) {
    await accounts.register(payload)
    // L'inscription ne renvoie pas de jeton : on connecte immédiatement
    // avec les identifiants saisis pour amener l'utilisateur sur l'écran
    // "compte en attente" déjà authentifié. Un enseignant peut ne pas avoir
    // de matricule (voir RegisterRequest) — on retombe alors sur l'e-mail,
    // que /login accepte aussi.
    return login({
      identifier: payload.registration_number || payload.email,
      password: payload.password,
    })
  }

  async function logout() {
    // Révoque le jeton côté serveur au lieu de simplement l'oublier sur
    // l'appareil — capturé avant suppression pour l'envoyer explicitement
    // (pas d'attente : best-effort, l'état local se nettoie tout de suite).
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (token) {
      api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
    setUser(null)
  }

  async function refreshUser() {
    const { data } = await api.get('/me')
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user))
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
