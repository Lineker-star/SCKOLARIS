// Mesure d'audience anonyme (Plausible — pas de cookie de suivi
// publicitaire, aucune revente de données) : chargée uniquement après
// consentement explicite de l'utilisateur (bandeau CookieConsent.jsx).
// Nécessite un compte Plausible (plausible.io ou une instance auto-hébergée)
// et son domaine renseigné dans VITE_PLAUSIBLE_DOMAIN — sans cette variable,
// le suivi reste silencieusement désactivé (rien ne casse).
const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN
const CONSENT_KEY = 'e-biblio-analytics-consent'
export const CONSENT_CHANGE_EVENT = 'e-biblio:analytics-consent-change'

export function getConsent() {
  return localStorage.getItem(CONSENT_KEY)
}

export function setConsent(value) {
  localStorage.setItem(CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }))
  if (value === 'accepted') loadPlausible()
}

// Permet de rouvrir le bandeau (ex: lien "Gérer les cookies" du pied de
// page) sans recharger la page.
export function resetConsent() {
  localStorage.removeItem(CONSENT_KEY)
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }))
}

let loaded = false

export function loadPlausible() {
  if (loaded || !DOMAIN) return
  loaded = true
  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = DOMAIN
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

export function trackPageview() {
  if (getConsent() === 'accepted' && typeof window.plausible === 'function') {
    window.plausible('pageview')
  }
}
