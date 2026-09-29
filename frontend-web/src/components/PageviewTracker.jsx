import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from '../services/analytics'

// L'appli étant une SPA, un changement de route ne recharge jamais la page —
// Plausible ne peut donc pas détecter la navigation tout seul, il faut le
// lui signaler manuellement à chaque changement de chemin.
export default function PageviewTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageview()
  }, [location.pathname])

  return null
}
