import { getLibrary } from './library'
import { downloadDocument } from './documents'
import { saveOfflineDocument, listOfflineDocuments, removeOfflineDocument } from './offlineStore'

// Émis sur `window` pour que n'importe quelle page (ex: MyLibrary.jsx)
// puisse réagir sans dépendre directement de qui a déclenché la synchro
// (DashboardLayout, à la connexion).
export const LIBRARY_SYNC_START = 'e-biblio:library-sync-start'
export const LIBRARY_SYNC_END = 'e-biblio:library-sync-end'

async function fetchCoverBlob(coverUrl) {
  if (!coverUrl) return null
  try {
    const res = await fetch(coverUrl)
    return res.ok ? await res.blob() : null
  } catch {
    return null
  }
}

// Aligne la bibliothèque locale (IndexedDB, propre à cet appareil/navigateur)
// sur la bibliothèque serveur (source de vérité, partagée entre appareils) :
// télécharge ce qui manque ici, retire ce qui a été retiré ailleurs. Échoue
// toujours en silence (hors ligne, compte non validé...) — la synchro ne
// doit jamais bloquer la navigation.
export async function syncLibrary(userId) {
  let serverDocuments
  try {
    const res = await getLibrary()
    serverDocuments = res.data.documents
  } catch {
    return
  }

  window.dispatchEvent(new CustomEvent(LIBRARY_SYNC_START))

  try {
    const localDocuments = await listOfflineDocuments(userId).catch(() => [])
    const serverIds = new Set(serverDocuments.map((doc) => doc.id))
    const localIds = new Set(localDocuments.map((doc) => doc.documentId))

    for (const doc of localDocuments) {
      if (!serverIds.has(doc.documentId)) {
        await removeOfflineDocument(userId, doc.documentId).catch(() => {})
      }
    }

    for (const doc of serverDocuments) {
      if (localIds.has(doc.id)) continue
      try {
        const res = await downloadDocument(doc.id)
        const coverBlob = await fetchCoverBlob(doc.cover_url)
        await saveOfflineDocument(userId, {
          id: doc.id,
          title: doc.title,
          author: doc.author,
          subject: doc.subdomain?.name,
          mime: res.data.type,
          extension: doc.file_path?.split('.').pop(),
          blob: res.data,
          coverBlob,
        })
      } catch {
        // Un document en échec (réseau, source indisponible...) ne doit pas
        // empêcher la synchro des autres.
      }
    }
  } finally {
    window.dispatchEvent(new CustomEvent(LIBRARY_SYNC_END))
  }
}
