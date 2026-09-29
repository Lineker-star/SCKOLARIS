import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { GlobeIcon } from './icons'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

// Équivalent mobile de LanguageSwitcher.jsx (web) : un vrai menu déroulant
// ancré sous un bouton n'est pas fiable partout en React Native sans
// mesurer la mise en page ; on réutilise donc Modal.jsx (déjà le pattern du
// projet pour "choisir une option dans une liste courte", voir NavDrawer).
export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  function choose(code) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel={t('common.chooseLanguage')}
        className={`flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-2.5 py-1.5 ${className}`}
      >
        <GlobeIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
        <Text className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
          {current.flag}
        </Text>
      </Pressable>

      {open && (
        <Modal title={t('common.chooseLanguage')} icon={<GlobeIcon width={20} height={20} className="text-primary dark:text-primary-night" />} onClose={() => setOpen(false)}>
          <View className="gap-1">
            {LANGUAGES.map(({ code, label, flag }) => (
              <Pressable
                key={code}
                onPress={() => choose(code)}
                className={`flex-row items-center gap-3 rounded px-3 py-3 ${
                  code === i18n.language ? 'bg-surface-container-high dark:bg-surface-container-high-night' : ''
                }`}
              >
                <Text className="text-lg leading-none">{flag}</Text>
                <Text
                  className={`text-sm text-on-surface dark:text-on-surface-night ${
                    code === i18n.language ? 'font-semibold' : ''
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}
    </>
  )
}
