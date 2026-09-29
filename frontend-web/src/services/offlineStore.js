// Stockage des documents téléchargés à l'intérieur de l'application
// (IndexedDB, scope navigateur/appareil), au lieu du dossier Téléchargements
// du système — le fichier reste "dans le compte", lisible hors ligne, et ne
// pollue jamais le stockage général de l'appareil (PC, Android, iOS).
//
// Cloisonné par utilisateur : plusieurs comptes peuvent partager le même
// navigateur (poste de bibliothèque, tests) sans voir les téléchargements
// des autres. La clé de chaque enregistrement est "<userId>:<documentId>".

const DB_NAME = 'e-biblio-offline'
// v2 : ajout de l'index "userId" (cloisonnement par compte). Incrémenté pour
// forcer la recréation du store chez les navigateurs qui avaient déjà la v1
// (sans quoi l'index n'existe jamais et toute requête indexée échoue).
const DB_VERSION = 2
const STORE = 'documents'

function makeKey(userId, documentId) {
  return `${userId}:${documentId}`
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      // Les anciens enregistrements (v1) n'ont pas de userId fiable : on
      // repart d'un store propre plutôt que de tenter une migration.
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE)
      }
      const store = db.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex('userId', 'userId', { unique: false })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, callback) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const store = tx.objectStore(STORE)
    const result = callback(store)
    tx.oncomplete = () => resolve(result?.result ?? result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function saveOfflineDocument(userId, document) {
  return withStore('readwrite', (store) =>
    store.put({
      ...document,
      id: makeKey(userId, document.id),
      documentId: document.id,
      userId,
      savedAt: new Date().toISOString(),
    }),
  )
}

export async function getOfflineDocument(userId, documentId) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(makeKey(userId, documentId))
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function listOfflineDocuments(userId) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE, 'readonly')
      .objectStore(STORE)
      .index('userId')
      .getAll(IDBKeyRange.only(userId))
    request.onsuccess = () => resolve(request.result ?? [])
    request.onerror = () => reject(request.error)
  })
}

export async function removeOfflineDocument(userId, documentId) {
  return withStore('readwrite', (store) => store.delete(makeKey(userId, documentId)))
}
