import api from './api'

// Calculé côté backend en R (voir StatsController) — peut prendre plusieurs
// secondes (lancement du processus Rscript à chaque appel, plus long avec
// beaucoup de données historiques), largement plus qu'un endpoint JSON
// classique. Marge généreuse pour ne jamais afficher une fausse erreur sur
// un simple pic de lenteur.
export function getAnalytics() {
  return api.get('/analytics', { timeout: 60_000 })
}
