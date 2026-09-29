import * as ImagePicker from 'expo-image-picker'

// Centralise les deux façons d'obtenir une photo (caméra vs galerie) — deux
// permissions système distinctes, demandées séparément par iOS/Android,
// chacune seulement au moment où l'utilisateur choisit réellement cette
// voie (jamais les deux d'un coup au chargement de l'écran). Utilisé par
// RegisterScreen (photo d'identité obligatoire) et ProfileScreen (photo de
// profil modifiable).
//
// `null` en retour signifie soit une permission refusée, soit une
// sélection annulée — l'appelant n'a pas besoin de distinguer les deux, il
// affiche simplement le sélecteur inchangé.

// 2 Mo, identique à la limite serveur (RegisterRequest/UpdateProfileRequest,
// `max:2048` en kilo-octets).
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024

function toAsset(asset) {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `photo.${asset.uri.split('.').pop()}`,
    type: asset.mimeType ?? 'image/jpeg',
    // Absent sur certains appareils/versions d'Expo — l'appelant doit
    // traiter `undefined` comme "taille inconnue", pas comme "trop grand".
    fileSize: asset.fileSize,
  }
}

export async function pickPhotoFromCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  })
  if (result.canceled) return null

  return toAsset(result.assets[0])
}

export async function pickPhotoFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  })
  if (result.canceled) return null

  return toAsset(result.assets[0])
}
