// API "legacy" explicite : SDK 57 a introduit de nouvelles classes
// File/Directory et déprécié downloadAsync/cacheDirectory/documentDirectory
// sur l'import par défaut. On garde volontairement l'ancienne API (toujours
// supportée, comportement identique) plutôt que de migrer sans pouvoir
// tester la nouvelle en conditions réelles ici.
import * as FileSystem from 'expo-file-system/legacy'
import api from './api'
import * as SecureStore from '../utils/secureStorage'

export function getDownloads() {
  return api.get('/downloads')
}

export function getMyUploads() {
  return api.get('/my-uploads')
}

// Les documents peuvent peser plusieurs centaines de Mo — le timeout par
// défaut d'`api` (15s) est prévu pour de petites requêtes JSON, bien trop
// court pour un envoi de fichier volumineux.
const LARGE_FILE_TIMEOUT = 600_000

export function createDocument(payload) {
  return api.post('/documents', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: LARGE_FILE_TIMEOUT,
  })
}

export function updateDocument(id, payload) {
  const formData = toFormData(payload)
  formData.append('_method', 'PUT')
  return api.post(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: LARGE_FILE_TIMEOUT,
  })
}

export function deleteDocument(id) {
  return api.delete(`/documents/${id}`)
}

// Lecture/téléchargement : `expo-file-system` télécharge en flux direct
// vers le disque (efficace, pas de blob géant en mémoire), mais
// `FileSystem.downloadAsync` ne supporte que GET. La route /download est en
// POST côté API (elle enregistre l'événement de téléchargement, BF12) : on
// l'appelle donc séparément pour la validation/le log, puis on récupère les
// octets via la route /read (GET) qui pointe vers le même fichier.
async function fetchDocumentToFile(id, destDir, filename) {
  const token = await SecureStore.getItemAsync('e-biblio-token')
  const dest = destDir + filename
  const { uri } = await FileSystem.downloadAsync(`${process.env.EXPO_PUBLIC_API_URL}/documents/${id}/read`, dest, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return uri
}

// Lecture "à la volée" (pas encore téléchargé) : copie temporaire, dans le
// cache de l'app — l'OS peut la nettoyer sous contrainte d'espace.
export async function readDocumentToFile(id, filename) {
  return fetchDocumentToFile(id, FileSystem.cacheDirectory, filename)
}

// Téléchargement réel pour "Ma bibliothèque" : copie permanente, dans le
// dossier documents privé de l'app.
export async function downloadDocumentToFile(id, filename) {
  // Déclenche la validation (compte validé requis) + le log serveur ; lève
  // une erreur (ex: 403) avant même de télécharger les octets si refusé.
  await api.post(`/documents/${id}/download`, {})
  return fetchDocumentToFile(id, FileSystem.documentDirectory, filename)
}

// Copie la couverture en local (disque "public", pas d'authentification
// requise) pour un affichage réellement disponible hors connexion dans "Ma
// bibliothèque", comme le PDF. Retourne null si absente/échec, sans faire
// échouer le téléchargement du document.
export async function downloadCoverToFile(coverUrl, filename) {
  if (!coverUrl) return null
  try {
    const { uri } = await FileSystem.downloadAsync(coverUrl, FileSystem.documentDirectory + filename)
    return uri
  } catch {
    return null
  }
}

function toFormData(payload) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  }
  return formData
}
