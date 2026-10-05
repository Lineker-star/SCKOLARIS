import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { MessageCircleIcon, SendIcon, WhatsAppIcon, XIcon } from './icons'
import { WHATSAPP_URL } from '../config/brand'

export default function Chatbot() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [{ role: 'bot', text: t('chatbot.greeting') }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  // L'accueil est une indication d'interface. Les réponses personnalisées,
  // notamment avec le prénom de l'utilisateur connecté, viennent du backend.
  useEffect(() => {
    setMessages((prev) => (prev.length === 1 ? [{ role: 'bot', text: t('chatbot.greeting') }] : prev))
  }, [i18n.language, t])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function send(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setDraft('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)

    try {
      const { data } = await api.post('/chat', {
        message: text,
        language: i18n.language.startsWith('en') ? 'en' : 'fr',
      })
      setMessages((prev) => [...prev, { role: 'bot', text: data.message }])
    } catch (err) {
      const serverMessage = err.response?.data?.message
      const text = serverMessage
        ?? (err.response ? t('chatbot.error') : 'Impossible de joindre le serveur SCKOLARIS pour le moment.')
      setMessages((prev) => [...prev, { role: 'bot', text }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex h-[min(28rem,70vh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl">
          <div className="flex items-center justify-between border-b border-outline-variant bg-primary px-4 py-3">
            <p className="text-sm font-semibold text-on-primary">{t('chatbot.title')}</p>
            <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="text-on-primary">
              <XIcon width={18} height={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-outline-variant p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={sending ? t('chatbot.loading') : t('chatbot.placeholder')}
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary-container"
      >
        {open ? <XIcon width={24} height={24} /> : <MessageCircleIcon width={24} height={24} />}
      </button>
    </div>
  )
}
