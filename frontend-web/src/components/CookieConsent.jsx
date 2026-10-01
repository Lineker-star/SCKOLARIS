import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CONSENT_CHANGE_EVENT, getConsent, loadPlausible, setConsent } from '../services/analytics'

export default function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function sync() {
      const consent = getConsent()
      if (consent === 'accepted') {
        loadPlausible()
        setVisible(false)
      } else if (consent === 'rejected') {
        setVisible(false)
      } else {
        setVisible(true)
      }
    }

    sync()
    window.addEventListener(CONSENT_CHANGE_EVENT, sync)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync)
  }, [])

  if (!visible) return null

  return (
    // left-4 + right-20 (jamais inset-x-0 plein écran) : laisse toujours un
    // couloir libre à droite pour les boutons flottants WhatsApp/assistant
    // (Chatbot.jsx, ancrés bottom-right) — sinon ce bandeau, en z-50, les
    // recouvre entièrement sur mobile tant qu'il n'est pas fermé.
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-20 z-50 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-lg sm:right-auto sm:max-w-sm">
      <p className="text-sm text-on-surface">
        <Trans
          i18nKey="cookieConsent.text"
          components={{ link: <a href="/politique-de-confidentialite" className="text-primary underline" /> }}
        />
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setConsent('accepted')}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container"
        >
          {t('cookieConsent.accept')}
        </button>
        <button
          onClick={() => setConsent('rejected')}
          className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
        >
          {t('cookieConsent.reject')}
        </button>
      </div>
    </div>
  )
}
