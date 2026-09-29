// Équivalent mobile de offlineStore.js (web, IndexedDB). Ici : les fichiers
// téléchargés vivent réellement sur le disque de l'appareil (dossier privé
// de l'app, via expo-file-system — jamais dans le dossier Téléchargements
// public), et les métadonnées dans AsyncStorage, une entrée par
// utilisateur pour garder le cloisonnement par compte du web.
import AsyncStorage from '@react-native-async-storage/async-storage'
// Voir la note dans services/documents.js : API "legacy" volontaire.
import * as FileSystem from 'expo-file-system/legacy'

function storageKey(userId) {
  return `e-biblio-offline:${userId}`
}

export async function listOfflineDocuments(userId) {
  const raw = await AsyncStorage.getItem(storageKey(userId))
  return raw ? JSON.parse(raw) : []
}

export async function getOfflineDocument(userId, documentId) {
  const list = await listOfflineDocuments(userId)
  return list.find((d) => d.documentId === String(documentId)) ?? null
}

// `document` : { id, title, author, subject, localUri }
export async function saveOfflineDocument(userId, document) {
  const list = await listOfflineDocuments(userId)
  const filtered = list.filter((d) => d.documentId !== String(document.id))
  filtered.push({
    ...document,
    documentId: String(document.id),
    userId,
    savedAt: new Date().toISOString(),
  })
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(filtered))
}

export async function removeOfflineDocument(userId, documentId) {
  const list = await listOfflineDocuments(userId)
  const removed = list.find((d) => d.documentId === String(documentId))
  const filtered = list.filter((d) => d.documentId !== String(documentId))
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(filtered))
  if (removed?.localUri) {
    await FileSystem.deleteAsync(removed.localUri, { idempotent: true }).catch(() => {})
  }
  if (removed?.localCoverUri) {
    await FileSystem.deleteAsync(removed.localCoverUri, { idempotent: true }).catch(() => {})
  }
}
