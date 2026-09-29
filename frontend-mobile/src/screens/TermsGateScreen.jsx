import { useState } from 'react'
import { View, Text, Pressable, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import { CheckIcon } from '../components/icons'

const TERMS_URL = 'https://e-biblio.vercel.app/conditions-utilisation'
const PRIVACY_URL = 'https://e-biblio.vercel.app/politique-de-confidentialite'

// Écran plein cadre affiché une seule fois, avant tout accès à l'app —
// équivalent mobile de l'écran de licence de l'installateur desktop : aucun
// moyen technique d'insérer un écran personnalisé dans l'installateur système
// Android (APK), donc l'acceptation se fait ici, au tout premier lancement.
export default function TermsGateScreen({ onAccept }) {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface dark:bg-surface-night">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="items-center">
          <Logo size={64} />
          <Text className="mt-4 text-xl font-bold text-on-surface dark:text-on-surface-night text-center">
            {t('termsGate.welcome')}
          </Text>
          <Text className="mt-2 text-sm text-on-surface-variant dark:text-on-surface-variant-night text-center">
            {t('termsGate.subtitle')}
          </Text>
        </View>

        <View className="mt-8 flex-1">
          <Text className="text-sm text-on-surface dark:text-on-surface-night leading-relaxed">
            {t('termsGate.intro')}
          </Text>

          <Pressable onPress={() => Linking.openURL(TERMS_URL)} className="mt-4">
            <Text className="text-sm font-semibold text-primary dark:text-primary-night underline">
              {t('termsGate.readTerms')}
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} className="mt-2">
            <Text className="text-sm font-semibold text-primary dark:text-primary-night underline">
              {t('termsGate.readPrivacy')}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setChecked((c) => !c)}
          className="mt-8 flex-row items-start gap-3"
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
        >
          <View
            className={`mt-0.5 h-6 w-6 items-center justify-center rounded border ${
              checked
                ? 'bg-primary border-primary dark:bg-primary-night dark:border-primary-night'
                : 'border-outline dark:border-outline-night'
            }`}
          >
            {checked && <CheckIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />}
          </View>
          <Text className="flex-1 text-sm text-on-surface dark:text-on-surface-night">
            {t('termsGate.acceptLabel')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => checked && onAccept()}
          disabled={!checked}
          className={`mt-6 items-center rounded-lg px-5 py-3.5 ${
            checked ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              checked
                ? 'text-on-primary dark:text-on-primary-night'
                : 'text-on-surface-variant dark:text-on-surface-variant-night'
            }`}
          >
            {t('termsGate.continue')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
