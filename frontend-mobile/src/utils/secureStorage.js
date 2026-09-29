import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

// expo-secure-store n'a pas d'implémentation web (Keychain/Keystore
// n'existent pas dans un navigateur). Le web n'est utilisé ici que pour le
// développement/tests — la cible finale est l'app native Android/iOS, où
// SecureStore fonctionne normalement. Sur web, on retombe sur AsyncStorage.
const isWeb = Platform.OS === 'web'

export function getItemAsync(key) {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key)
}

export function setItemAsync(key, value) {
  return isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value)
}

export function deleteItemAsync(key) {
  return isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key)
}
