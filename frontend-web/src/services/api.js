import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  const detail = { status, action }
  window.dispatchEvent(new CustomEvent('network-status', { detail }))
}

if (!navigator.onLine) {
  emitNetworkStatus('offline')
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('e-biblio-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Nouvelle tentative automatique (avec délai croissant) sur une connexion
// instable — uniquement pour des requêtes de lecture (GET/HEAD, sans effet
// de bord à dupliquer) qui échouent pour une raison transitoire (coupure
// réseau, délai dépassé, erreur serveur 5xx passagère) : une simple
// requête POST/PUT/DELETE n'est jamais rejouée automatiquement, pour ne
// jamais risquer une double soumission (double dépôt de document, etc.).
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

api.interceptors.response.use(
  (response) => {
    if (navigator.onLine) {
      emitNetworkStatus('stable')
    }
    return response
  },
  async (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && hadAuthHeader) {
      localStorage.removeItem('e-biblio-token')
      localStorage.removeItem('e-biblio-user')
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.href = '/connexion'
      }
      return Promise.reject(error)
    }

    if (!navigator.onLine || !error.response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(error.code)) {
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
