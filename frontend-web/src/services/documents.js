import api from './api'

// URL signée temporaire (voir DocumentController::readLink) : le navigateur
// navigue dessus directement, sans jeton — permet un vrai streaming natif
// (visionneur PDF du navigateur) au lieu de tout charger en mémoire avant
// affichage.
export function getReadLink(id) {
  return api.get(`/documents/${id}/read-link`)
}

// Les documents peuvent peser plusieurs centaines de Mo — le timeout par
// défaut d'`api` (15s) est prévu pour de petites requêtes JSON, bien trop
// court pour un transfert de fichier volumineux.
const LARGE_FILE_TIMEOUT = 600_000

export function downloadDocument(id) {
  return api.post(`/documents/${id}/download`, {}, { responseType: 'blob', timeout: LARGE_FILE_TIMEOUT })
}

export function getDownloads() {
  return api.get('/downloads')
}

export function getMyUploads() {
  return api.get('/my-uploads')
}

export function createDocument(payload) {
  const formData = toFormData(payload)
  return api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: LARGE_FILE_TIMEOUT,
  })
}

export function updateDocument(id, payload) {
  const formData = toFormData(payload)
  formData.append('_method', 'PUT')
  return api.post(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: LARGE_FILE_TIMEOUT,
  })
}

export function deleteDocument(id) {
  return api.delete(`/documents/${id}`)
}

function toFormData(payload) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  }
  return formData
}
