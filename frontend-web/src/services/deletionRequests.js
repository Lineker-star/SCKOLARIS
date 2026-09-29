import api from './api'

export function requestDeletion(documentId, justification) {
  return api.post(`/documents/${documentId}/deletion-request`, { justification })
}

export function getDeletionRequests() {
  return api.get('/deletion-requests')
}

export function processDeletionRequest(id, decision) {
  return api.patch(`/deletion-requests/${id}`, { decision })
}
