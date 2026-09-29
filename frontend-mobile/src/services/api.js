import { create } from 'axios'
import * as SecureStore from '../utils/secureStorage'
import { emitUnauthorized } from '../utils/authEvents'

// En dev sur un appareil/émulateur réel, "localhost" pointe vers le
// téléphone lui-même, pas vers la machine qui fait tourner le backend
// Laravel. Voir le .env.example pour les valeurs à utiliser selon le cas
// (émulateur Android, appareil physique sur le même réseau, etc.).
const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15_000,
})

function actionForRequest(config) {
  if (config?.networkAction) return config.networkAction

  const url = config?.url ?? ''
  const method = config?.method?.toLowerCase()
  if (url.includes('/register')) return 'votre inscription'
  if (url.includes('/login')) return 'votre connexion'
  if (url.includes('/forgot-password') || url.includes('/reset-password')) return 'la réinitialisation du mot de passe'
  if (url.includes('/me')) return method === 'get' ? 'le chargement de votre profil' : 'la sauvegarde de votre profil'
  if (url.includes('/documents')) return method === 'get' ? 'le chargement du document' : 'la gestion du document'
  if (url.includes('/catalog')) return 'le chargement du catalogue'
  if (url.includes('/library')) return 'votre bibliothèque'
  if (url.includes('/notifications')) return 'vos notifications'
  if (url.includes('/domains')) return 'la gestion des domaines'
  if (url.includes('/accounts')) return 'la gestion des comptes'
  if (url.includes('/chat')) return 'la réponse de l’assistant'
  return method === 'get' ? 'le chargement des données' : 'cette opération'
}

function emitNetworkStatus(status, action) {
  const { DeviceEventEmitter } = require('react-native')
  DeviceEventEmitter.emit('network-status', { status, action })
}

if (!globalThis.navigator || !globalThis.navigator.onLine) {
  emitNetworkStatus('offline')
}

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('e-biblio-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Nouvelle tentative automatique (avec délai croissant) sur une connexion
// mobile instable — uniquement pour des requêtes de lecture (GET/HEAD,
// sans effet de bord à dupliquer) qui échouent pour une raison transitoire
// (coupure réseau, délai dépassé, erreur serveur 5xx passagère) : une
// simple requête POST/PUT/DELETE n'est jamais rejouée automatiquement,
// pour ne jamais risquer une double soumission (double dépôt, etc.).
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 600 // doublé à chaque tentative (600, 1200)

function isRetryableError(error) {
  const method = error.config?.method?.toLowerCase()
  if (method !== 'get' && method !== 'head') return false

  if (!error.response) {
    // Pas de réponse du tout : coupure réseau ou délai dépassé.
    return true
  }
  return error.response.status >= 500
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Jeton expiré/révoqué (ex: expiration après 1 jour) → 401 sur une requête
// pourtant authentifiée : on prévient AuthContext pour qu'il nettoie la
// session, peu importe le rôle de l'utilisateur. RootNavigator réagit
// automatiquement (user devient null) et ramène sur l'écran d'accueil.
api.interceptors.response.use(
  (response) => {
    if (globalThis.navigator?.onLine) {
      emitNetworkStatus('stable')
    }
    return response
  },
  async (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && hadAuthHeader) {
      emitUnauthorized()
      return Promise.reject(error)
    }

    if (!globalThis.navigator?.onLine || !error.response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(error.code)) {
      emitNetworkStatus('unstable', actionForRequest(error.config))
    }

    const config = error.config
    if (config && isRetryableError(error)) {
      config.__retryCount = (config.__retryCount ?? 0) + 1
      if (config.__retryCount <= MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * config.__retryCount)
        return api(config)
      }
    }

    return Promise.reject(error)
  },
)

export default api
