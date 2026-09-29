import { Component } from 'react'

// Filet de sécurité pour un cas précis : les pages sont chargées à la
// demande (`lazy()` dans App.jsx), donc chaque navigation vers une page pas
// encore visitée télécharge son fichier JS séparément, par son nom exact
// (avec un hash de build, ex: MyLibrary-Dcds4RzX.js). Si un nouveau
// déploiement a eu lieu depuis l'ouverture de la page (le cas typique de
// l'app desktop : une fois lancée, sa fenêtre reste ouverte indéfiniment,
// contrairement à un onglet de navigateur qu'on ferme/rouvre plus souvent),
// l'ancien fichier n'existe plus sur le serveur — l'import échoue, React ne
// sait pas afficher l'erreur (aucun ErrorBoundary avant celui-ci) et
// démonte tout l'arbre : la fenêtre devient blanche, sans aucun message.
//
// Ce composant intercepte cette erreur précise et force un rechargement
// complet (une seule fois, pour éviter une boucle infinie si l'erreur est
// en fait permanente) — l'utilisateur récupère l'app à jour au lieu d'une
// page blanche muette. Pour toute autre erreur (un vrai bug), affiche un
// message avec un bouton "Recharger" au lieu de recharger automatiquement,
// pour ne jamais masquer un problème réel derrière des rechargements en boucle.
const RELOAD_FLAG = 'e-biblio-chunk-reload-attempted'

function isChunkLoadError(error) {
  const message = String(error?.message || '')
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  )
}

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1')
      window.location.reload()
      return
    }
    console.error('Erreur applicative :', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    // Détail technique affiché directement (pas seulement en console) : sur
    // l'app desktop, le retour utilisateur passe le plus souvent par une
    // simple capture d'écran plutôt que par la console DevTools — l'avoir
    // ici évite un aller-retour pour obtenir le message exact.
    const detail = this.state.error ? `${this.state.error.name || 'Error'}: ${this.state.error.message || ''}` : ''

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <p className="text-base font-semibold text-on-surface">Une erreur est survenue.</p>
        <p className="max-w-sm text-sm text-on-surface-variant">
          Ferme et relance l'application. Si le problème persiste, contacte le support.
        </p>
        {detail && (
          <p className="max-w-md break-words rounded bg-surface-container px-3 py-2 font-mono text-xs text-on-surface-variant">
            {detail}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container"
        >
          Recharger
        </button>
      </div>
    )
  }
}
