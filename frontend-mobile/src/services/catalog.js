import api from './api'

export function getCatalog(params = {}) {
  return api.get('/catalog', { params })
}

export function getDocument(id) {
  return api.get(`/documents/${id}`)
}
