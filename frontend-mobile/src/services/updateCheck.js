import Constants from 'expo-constants'
import api from './api'

// État partagé (module-level) plutôt que par écran : AppShell est
// remonté à chaque navigation (chaque écran l'instancie), donc un simple
// useState local relancerait la vérification et referait réapparaître la
// bannière après un "Plus tard" à chaque changement d'écran.
let dismissed = false
let knownUpdate = null // { version, url } | null
let checking = null

export function getKnownUpdate() {
  return dismissed ? null : knownUpdate
}

export function dismissUpdate() {
  dismissed = true
}

// Échoue toujours en silence (hors ligne...) — jamais bloquant pour la
// navigation. Sans effet après le premier appel réussi de la session.
export async function checkForUpdate() {
  if (checking) return checking

  checking = api.get('/app-releases')
    .then((res) => {
      const release = res.data.releases?.android
      const current = Constants.expoConfig?.version
      if (release?.version && current && release.version !== current) {
        knownUpdate = { version: release.version, url: release.url }
      }
    })
    .catch(() => {})
    .finally(() => {
      checking = null
    })

  return checking
}
