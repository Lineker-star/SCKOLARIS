import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { askAssistant, sendFeedback } from '../services/ai'
import { useAiChat } from '../context/AiChatContext'
import { MessageCircleIcon, SendIcon, ThumbsDownIcon, ThumbsUpIcon, WhatsAppIcon, XIcon } from './icons'
import { WHATSAPP_URL } from '../config/brand'

// L'assistant envoie les questions au backend Laravel, qui applique le RAG
// et appelle Gemini. Aucune clé ni base de réponses n'est utilisée côté
// mobile. Le widget est monté une seule fois (RootNavigator) ; ouvert/fermé
// et pré-scopé à un document via AiChatContext (voir DocumentReaderScreen).
export default function Chatbot() {
  const { t, i18n } = useTranslation()
  const { open, document, openGeneral, close } = useAiChat()
  const [messages, setMessages] = useState(() => [{ role: 'bot', text: t('chatbot.greeting') }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const scrollRef = useRef(null)

  // À l'ouverture pré-scopée à un document, on réinitialise la
  // conversation avec un accueil dédié plutôt que l'historique général.
  useEffect(() => {
    if (!open) return
    setConversationId(null)
    setMessages([{ role: 'bot', text: document ? t('askAi.greeting') : t('chatbot.greeting') }])
  }, [open, document, t])

  async function send() {
    const text = draft.trim()
    if (!text || sending) return

    setDraft('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)

    try {
      const { data } = await askAssistant({
        message: text,
        language: i18n.language.startsWith('en') ? 'en' : 'fr',
        documentId: document?.id,
        conversationId,
      })
      setConversationId(data.conversation_id ?? conversationId)
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.message, messageId: data.message_id, citations: data.citations ?? [] },
      ])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: t('chatbot.error') }])
    } finally {
      setSending(false)
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
  }

  return (
    <>
      {!document && (
        <View className="absolute bottom-6 right-5 items-center gap-3">
          <Pressable
            onPress={() => Linking.openURL(WHATSAPP_URL)}
            accessibilityLabel="Contacter SCKOLARIS sur WhatsApp"
            className="h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg"
          >
            <WhatsAppIcon width={24} height={24} className="text-white" />
          </Pressable>
          <Pressable
            onPress={openGeneral}
            accessibilityLabel={t('chatbot.openAssistant')}
            className="h-14 w-14 items-center justify-center rounded-full bg-primary dark:bg-primary-night shadow-lg"
          >
            <MessageCircleIcon width={24} height={24} className="text-on-primary dark:text-on-primary-night" />
          </Pressable>
        </View>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View className="flex-1 justify-end bg-inverse-surface/40 dark:bg-inverse-surface-night/40">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="h-[75%] rounded-t-2xl bg-surface-container-lowest dark:bg-surface-container-lowest-night overflow-hidden"
          >
            <View className="flex-row items-center justify-between bg-primary dark:bg-primary-night px-4 py-3">
              <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-on-primary dark:text-on-primary-night">
                {document ? `${t('askAi.buttonLabel')} — ${document.title}` : t('chatbot.title')}
              </Text>
              <Pressable onPress={close} accessibilityLabel={t('common.close')}>
                <XIcon width={20} height={20} className="text-on-primary dark:text-on-primary-night" />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4 py-3"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m, i) => (
                <View key={i} className={`mb-3 flex-row ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <View className="max-w-[85%]">
                    <View
                      className={`rounded-lg px-3 py-2 ${
                        m.role === 'user'
                          ? 'bg-primary dark:bg-primary-night'
                          : 'bg-surface-container dark:bg-surface-container-night'
                      }`}
                    >
                      <Text
                        className={`text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'text-on-primary dark:text-on-primary-night'
                            : 'text-on-surface dark:text-on-surface-night'
                        }`}
                      >
                        {m.text}
                      </Text>
                    </View>
                    {m.citations?.length > 0 && (
                      <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                        {m.citations.map((citation, ci) => (
                          <View key={ci} className="rounded bg-surface-container-high dark:bg-surface-container-high-night px-2 py-0.5">
                            <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                              {citation.title ? `${citation.title}${citation.page_number ? ' · ' + t('askAi.page', { page: citation.page_number }) : ''}` : t('askAi.page', { page: citation.page_number })}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {m.role === 'bot' && m.messageId && <FeedbackButtons messageId={m.messageId} />}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row items-center gap-2 border-t border-outline-variant dark:border-outline-variant-night p-3">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={sending ? t('chatbot.loading') : t('chatbot.placeholder')}
                onSubmitEditing={send}
                returnKeyType="send"
                className="flex-1 rounded border border-outline dark:border-outline-night bg-surface dark:bg-surface-night px-3 py-2 text-sm text-on-surface dark:text-on-surface-night"
              />
              <Pressable
                onPress={send}
                disabled={!draft.trim() || sending}
                accessibilityLabel={t('common.send')}
                className="rounded bg-primary dark:bg-primary-night p-2.5 disabled:opacity-50"
              >
                <SendIcon width={18} height={18} className="text-on-primary dark:text-on-primary-night" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  )
}

function FeedbackButtons({ messageId }) {
  const { t } = useTranslation()
  const [sent, setSent] = useState(null)

  async function rate(rating) {
    if (sent) return
    setSent(rating)
    try {
      await sendFeedback(messageId, rating)
    } catch {
      setSent(null)
    }
  }

  if (sent) {
    return <Text className="mt-1.5 text-xs text-on-surface-variant dark:text-on-surface-variant-night">{t('askAi.feedbackThanks')}</Text>
  }

  return (
    <View className="mt-1.5 flex-row items-center gap-2">
      <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">{t('askAi.feedbackPrompt')}</Text>
      <Pressable onPress={() => rate('up')} accessibilityLabel="up">
        <ThumbsUpIcon width={14} height={14} className="text-on-surface-variant dark:text-on-surface-variant-night" />
      </Pressable>
      <Pressable onPress={() => rate('down')} accessibilityLabel="down">
        <ThumbsDownIcon width={14} height={14} className="text-on-surface-variant dark:text-on-surface-variant-night" />
      </Pressable>
    </View>
  )
}
