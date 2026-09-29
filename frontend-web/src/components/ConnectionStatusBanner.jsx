import { useEffect, useState } from 'react'

export default function ConnectionStatusBanner() {
  const [status, setStatus] = useState(() => (navigator.onLine ? 'stable' : 'offline'))
  const [action, setAction] = useState('cette opération')
  const [restoreNotice, setRestoreNotice] = useState(false)

  useEffect(() => {
    const handleNetworkStatus = (event) => {
      const nextStatus = event.detail?.status
      if (nextStatus === 'unstable') {
        setStatus('unstable')
        setAction(event.detail?.action ?? 'cette opération')
        setRestoreNotice(false)
        return
      }
      if (nextStatus === 'stable') {
        setStatus('stable')
        if (event.detail?.action) setAction(event.detail.action)
        setRestoreNotice(true)
        window.setTimeout(() => setRestoreNotice(false), 4000)
        return
      }
    }

    const handleOnline = () => {
      setStatus('stable')
      setRestoreNotice(true)
      window.setTimeout(() => setRestoreNotice(false), 4000)
    }

    const handleOffline = () => {
      setStatus('offline')
      setRestoreNotice(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('network-status', handleNetworkStatus)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('network-status', handleNetworkStatus)
    }
  }, [])

  if (status === 'stable' && !restoreNotice) return null

  const isWarning = status !== 'stable'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-md border px-3 py-2 text-sm shadow-lg backdrop-blur ${
        isWarning
          ? 'border-warning bg-warning-container text-on-warning-container'
          : 'border-success bg-success-container text-on-success-container'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isWarning ? 'bg-warning' : 'bg-success'}`} />
        <span className="font-semibold">
          {restoreNotice
            ? `Connexion rétablie — vous pouvez réessayer ${action}.`
            : status === 'offline'
              ? `Connexion instable / hors ligne pendant ${action} — veuillez patienter.`
              : `Connexion instable pendant ${action} — veuillez patienter.`}
        </span>
      </div>
    </div>
  )
}
