import { View, Text, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'

// Portage de AuthLayout.jsx (web).
export default function AuthLayout({ children }) {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface dark:bg-surface-night">
      <View className="flex-row items-center justify-between border-b border-outline-variant dark:border-outline-variant-night px-4 py-3">
        <Pressable
          onPress={() => navigation.navigate('Home')}
          className="flex-row items-center gap-2"
        >
          <Logo size={28} />
          <View>
            <Text className="text-lg font-bold text-primary dark:text-primary-night">{BRAND_NAME}</Text>
            <Text className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-night leading-tight">{BRAND_TAGLINE}</Text>
          </View>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="flex-grow px-4 py-8">
          <View className="w-full rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6">
            {children}
          </View>
          <Text className="text-center text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-6">
            {t('authLayout.copyright')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
