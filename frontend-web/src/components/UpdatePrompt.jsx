import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'
import { DownloadIcon, CheckIcon, XIcon } from './icons'

export default function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Vérifie régulièrement si une nouvelle version a été déployée.
      if (registration) {
        setInterval(() => registration.update(), 5 * 60 * 1000)
      }
    },
  })

  useEffect(() => {
    function checkOnReturn() {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker?.getRegistration().then((registration) => registration?.update())
      }
    }

    window.addEventListener('focus', checkOnReturn)
    document.addEventListener('visibilitychange', checkOnReturn)
    window.addEventListener('online', checkOnReturn)

    return () => {
      window.removeEventListener('focus', checkOnReturn)
      document.removeEventListener('visibilitychange', checkOnReturn)
      window.removeEventListener('online', checkOnReturn)
    }
  }, [])

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-lg sm:left-auto sm:right-4 sm:translate-x-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-primary">
          {needRefresh ? <DownloadIcon width={20} height={20} /> : <CheckIcon width={20} height={20} />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-surface">
            {needRefresh ? 'Nouvelle version disponible' : 'SCKOLARIS est prêt hors ligne'}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {needRefresh
              ? "Une mise à jour du site a été téléchargée. Rechargez pour l'appliquer."
              : "L'application peut maintenant fonctionner sans connexion internet."}
          </p>
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="mt-3 inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:bg-primary-container"
            >
              Mettre à jour
            </button>
          )}
        </div>
        <button onClick={close} aria-label="Fermer" className="text-on-surface-variant hover:text-on-surface">
          <XIcon width={18} height={18} />
        </button>
      </div>
    </div>
  )
}
