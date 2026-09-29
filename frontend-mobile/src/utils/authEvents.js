// Petit pub/sub interne pour signaler une déconnexion forcée (jeton
// expiré/invalide, détecté par l'intercepteur de réponse d'axios dans
// services/api.js) à AuthContext, qui n'est pas accessible depuis un
// module hors de l'arbre React.
const listeners = new Set()

export function onUnauthorized(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitUnauthorized() {
  listeners.forEach((listener) => listener())
}
