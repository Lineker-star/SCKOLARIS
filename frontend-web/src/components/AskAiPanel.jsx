import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { askAssistant, sendFeedback } from '../services/ai'
import { SendIcon, SparklesIcon, ThumbsDownIcon, ThumbsUpIcon } from './icons'

export default function AskAiPanel({ documentId, documentTitle, onClose }) {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState(() => [{ role: 'bot', text: t('askAi.greeting') }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setDraft('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)

    try {
      const { data } = await askAssistant({
        message: text,
        language: i18n.language.startsWith('en') ? 'en' : 'fr',
        documentId,
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
  }

  return (
    <Modal title={documentTitle ? `${t('askAi.title')} — ${documentTitle}` : t('askAi.title')} icon={<SparklesIcon width={20} height={20} />} onClose={onClose}>
      <div className="flex h-[26rem] flex-col">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pb-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[90%]">
                <p
                  className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {m.text}
                </p>
                {m.citations?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.citations.map((citation, ci) => (
                      <span
                        key={ci}
                        className="rounded bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant"
                        title={citation.title ?? ''}
                      >
                        {citation.title ? `${citation.title}${citation.page_number ? ' · ' + t('askAi.page', { page: citation.page_number }) : ''}` : t('askAi.page', { page: citation.page_number })}
                      </span>
                    ))}
                  </div>
                )}
                {m.role === 'bot' && m.messageId && <FeedbackButtons messageId={m.messageId} />}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-outline-variant pt-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={sending ? t('chatbot.loading') : t('askAi.placeholder')}
            className="flex-1 rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
          <button
            type="submit"
            aria-label={t('common.send')}
            className="rounded bg-primary p-2 text-on-primary hover:bg-primary-container disabled:opacity-50"
            disabled={!draft.trim() || sending}
          >
            <SendIcon width={18} height={18} />
          </button>
        </form>
      </div>
    </Modal>
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
    return <p className="mt-1.5 text-xs text-on-surface-variant">{t('askAi.feedbackThanks')}</p>
  }

  return (
    <div className="mt-1.5 flex items-center gap-2 text-on-surface-variant">
      <span className="text-xs">{t('askAi.feedbackPrompt')}</span>
      <button onClick={() => rate('up')} aria-label="up" className="hover:text-primary">
        <ThumbsUpIcon width={14} height={14} />
      </button>
      <button onClick={() => rate('down')} aria-label="down" className="hover:text-error">
        <ThumbsDownIcon width={14} height={14} />
      </button>
    </div>
  )
}
