import api from './api'

// POST /chat gère à la fois l'assistant plateforme (comportement inchangé)
// et « Ask this book » — documentId/conversationId sont omis dans le
// premier cas, ce qui laisse le backend router vers son comportement par
// défaut (voir ChatController::message()).
export function askAssistant({ message, language, documentId, conversationId }) {
  return api.post('/chat', {
    message,
    language,
    document_id: documentId,
    conversation_id: conversationId,
  })
}

export function getConversations() {
  return api.get('/ai/conversations')
}

export function getConversation(id) {
  return api.get(`/ai/conversations/${id}`)
}

export function deleteConversation(id) {
  return api.delete(`/ai/conversations/${id}`)
}

export function sendFeedback(messageId, rating, reason) {
  return api.post('/ai/feedback', { message_id: messageId, rating, reason })
}

// --- Administration (admin uniquement) ---

export function getAiDocuments(status) {
  return api.get('/admin/ai/documents', { params: status ? { status } : {} })
}

export function getAiUsageStats() {
  return api.get('/admin/ai/usage')
}

export function indexAiDocument(documentId, force = false) {
  return api.post(`/admin/ai/documents/${documentId}/index`, {}, { params: force ? { force: 1 } : {} })
}
