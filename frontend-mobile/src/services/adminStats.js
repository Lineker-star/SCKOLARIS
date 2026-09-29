import api from './api'

// Calculé côté backend en R (voir StatsController) — peut prendre plusieurs
// secondes (lancement du processus Rscript à chaque appel).
export function getAnalytics() {
  return api.get('/analytics', { timeout: 60_000 })
}
