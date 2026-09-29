import api from './api'

export function sendContactMessage(payload) {
  return api.post('/contact', payload)
}
