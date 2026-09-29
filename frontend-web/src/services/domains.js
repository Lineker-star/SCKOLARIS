import api from './api'

export function getDomains() {
  return api.get('/domains')
}

export function createDomain(name) {
  return api.post('/domains', { name })
}

export function updateDomain(id, name) {
  return api.put(`/domains/${id}`, { name })
}

export function deleteDomain(id) {
  return api.delete(`/domains/${id}`)
}

export function createSubdomain(domainId, name) {
  return api.post(`/domains/${domainId}/subdomains`, { name })
}

export function updateSubdomain(id, payload) {
  return api.put(`/subdomains/${id}`, payload)
}

export function deleteSubdomain(id) {
  return api.delete(`/subdomains/${id}`)
}
