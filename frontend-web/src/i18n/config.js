import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './locales/fr.json'
import en from './locales/en.json'

// Persisté dans localStorage (clé "i18nextLng", gérée par le détecteur
// ci-dessous) : la langue choisie survit à un rechargement, comme le thème
// (voir ThemeContext). Le détecteur ne sert qu'au tout premier lancement,
// avant qu'un choix explicite n'existe — il retombe alors sur la langue du
// navigateur, avec le français par défaut si elle n'est ni fr ni en.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React échappe déjà le JSX, pas besoin d'un double échappement
    },
  })

export default i18n
