import { getLibrary } from './library'
import { downloadDocumentToFile, downloadCoverToFile } from './documents'
import { saveOfflineDocument, listOfflineDocuments, removeOfflineDocument } from './offlineStore'

// Même pub/sub minimal que utils/authEvents.js, pour que MyLibraryScreen
// puisse afficher un indicateur sans dépendre de qui déclenche la synchro
// (AppShell, à la connexion).
const startListeners = new Set()
const endListeners = new Set()

export function onLibrarySyncStart(listener) {
  startListeners.add(listener)
  return () => startListeners.delete(listener)
}

export function onLibrarySyncEnd(listener) {
  endListeners.add(listener)
  return () => endListeners.delete(listener)
}

function filenameFor(doc) {
  const ext = doc.file_path?.split('.').pop() || 'pdf'
  return `document-${doc.id}.${ext}`
}

function coverFilenameFor(doc) {
  const ext = doc.cover_path?.split('.').pop() || 'jpg'
  return `cover-${doc.id}.${ext}`
}

// Portage de librarySync.js (web) : aligne la bibliothèque locale
// (AsyncStorage + fichiers sur disque, propre à cet appareil) sur la
// bibliothèque serveur (source de vérité, partagée entre appareils).
// Échoue toujours en silence — jamais bloquant pour la navigation.
export async function syncLibrary(userId) {
  let serverDocuments
  try {
    const res = await getLibrary()
    serverDocuments = res.data.documents
  } catch {
    return
  }

  startListeners.forEach((listener) => listener())

  try {
    const localDocuments = await listOfflineDocuments(userId).catch(() => [])
    const serverIds = new Set(serverDocuments.map((doc) => String(doc.id)))
    const localIds = new Set(localDocuments.map((doc) => doc.documentId))

    for (const doc of localDocuments) {
      if (!serverIds.has(doc.documentId)) {
        await removeOfflineDocument(userId, doc.documentId).catch(() => {})
      }
    }

    for (const doc of serverDocuments) {
      if (localIds.has(String(doc.id))) continue
      try {
        const localUri = await downloadDocumentToFile(doc.id, filenameFor(doc))
        const localCoverUri = await downloadCoverToFile(doc.cover_url, coverFilenameFor(doc))
        await saveOfflineDocument(userId, {
          id: doc.id,
          title: doc.title,
          author: doc.author,
          subject: doc.subdomain?.name,
          localUri,
          localCoverUri,
        })
      } catch {
        // Un document en échec (réseau, source indisponible...) ne doit pas
        // empêcher la synchro des autres.
      }
    }
  } finally {
    endListeners.forEach((listener) => listener())
  }
}
