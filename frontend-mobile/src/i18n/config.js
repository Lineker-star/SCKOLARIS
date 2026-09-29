import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import fr from './locales/fr.json'
import en from './locales/en.json'

const LANGUAGE_KEY = 'e-biblio-language'

// `i18next-browser-languagedetector` (utilisé côté web) suppose `window`/
// `localStorage` — inexistants en React Native. Ce détecteur maison suit
// exactement le même principe que ThemeContext.jsx (AsyncStorage, avec la
// langue de l'appareil comme repli au tout premier lancement) plutôt que
// d'ajouter une dépendance dédiée pour un besoin aussi simple.
const asyncStorageDetector = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback) => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY)
      if (stored === 'fr' || stored === 'en') return callback(stored)
    } catch {
      // Stockage indisponible — on retombe sur la langue de l'appareil.
    }
    const deviceLanguage = Localization.getLocales()[0]?.languageCode
    callback(deviceLanguage === 'en' ? 'en' : 'fr')
  },
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language)
    } catch {
      // Pas grave — le choix ne survivra juste pas à un redémarrage.
    }
  },
}

i18n
  .use(asyncStorageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
