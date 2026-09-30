import api from './api'

// Miroir de frontend-web/src/services/ai.js — voir ce fichier pour le
// contexte. documentId/conversationId omis = comportement inchangé de
// l'assistant plateforme (voir ChatController::message()).
export function askAssistant({ message, language, documentId, conversationId }) {
  return api.post('/chat', {
    message,
    language,
    document_id: documentId,
    conversation_id: conversationId,
  })
}

export function sendFeedback(messageId, rating, reason) {
  return api.post('/ai/feedback', { message_id: messageId, rating, reason })
}
