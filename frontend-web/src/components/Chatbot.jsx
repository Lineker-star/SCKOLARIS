import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AiAvatar from './AiAvatar'
import { SendIcon, WhatsAppIcon, XIcon } from './icons'
import { WHATSAPP_URL } from '../config/brand'

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export default function Chatbot() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [{ role: 'bot', text: t('chatbot.greeting') }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setMessages((prev) => (prev.length === 1 && prev[0].role === 'bot' ? [{ role: 'bot', text: t('chatbot.greeting') }] : prev))
  }, [i18n.language, t])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const suggestions = t('chatbot.suggestions', { returnObjects: true })
  const showSuggestions = messages.length === 1 && Array.isArray(suggestions)

  async function ask(text) {
    const question = text.trim()
    if (!question || sending) return

    setDraft('')
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setSending(true)

    try {
      const { data } = await api.post('/chat', {
        message: question,
        language: i18n.language.startsWith('en') ? 'en' : 'fr',
      })
      setMessages((prev) => [...prev, { role: 'bot', text: data.message }])
    } catch (err) {
      const serverMessage = err.response?.data?.message
      const text = serverMessage
        ?? (err.response ? t('chatbot.error') : t('chatbot.unreachable'))
      setMessages((prev) => [...prev, { role: 'bot', text, error: true }])
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    ask(draft)
  }

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 flex flex-col items-end">
      {open && (
        <section
          role="dialog"
          aria-label={t('chatbot.aiName')}
          className="mb-3 flex h-[min(34rem,75vh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl"
        >
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-on-primary">
            <AiAvatar size={38} online inverse />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">{t('chatbot.aiName')}</p>
              <p className="truncate text-xs opacity-80">{t('chatbot.aiStatus')}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('common.close')}
              className="rounded-full p-1 hover:bg-on-primary/10"
            >
              <XIcon width={18} height={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-surface px-4 py-4" aria-live="polite">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm leading-relaxed text-on-primary">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <AiAvatar size={28} />
                  <p
                    className={`max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm leading-relaxed ${
                      m.error
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ),
            )}

            {sending && (
              <div className="flex items-end gap-2">
                <AiAvatar size={28} />
                <div className="rounded-2xl rounded-bl-sm bg-surface-container px-3.5 py-2">
                  <TypingIndicator />
                  <span className="sr-only">{t('chatbot.loading')}</span>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1 pl-9">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="rounded-full border border-primary/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-on-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-outline-variant bg-surface-container-lowest p-3">
            <div className="flex items-center gap-2 rounded-full border border-outline bg-surface px-2 py-1 focus-within:border-primary">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-on-surface outline-none"
              />
              <button
                type="submit"
                aria-label={t('common.send')}
                className="rounded-full bg-primary p-2 text-on-primary hover:bg-primary-container disabled:opacity-40"
                disabled={!draft.trim() || sending}
              >
                <SendIcon width={16} height={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-on-surface-variant">{t('chatbot.disclaimer')}</p>
          </form>
        </section>
      )}

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter SCKOLARIS sur WhatsApp"
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:brightness-95"
      >
        <WhatsAppIcon width={24} height={24} />
      </a>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('chatbot.openAssistant')}
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full shadow-xl ring-4 ring-primary/20 transition hover:scale-105"
      >
        {open ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
            <XIcon width={24} height={24} />
          </span>
        ) : (
          <AiAvatar size={56} online />
        )}
      </button>
    </div>
  )
}
