import api from './api'

export function getLibrary() {
  return api.get('/library')
}

export function removeFromLibrary(documentId) {
  return api.delete(`/library/${documentId}`)
}
