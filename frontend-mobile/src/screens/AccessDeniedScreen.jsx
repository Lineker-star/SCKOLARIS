import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import InfoCallout from '../components/InfoCallout'
import { useAuth } from '../context/AuthContext'
import { XCircleIcon, InfoIcon } from '../components/icons'

// Portage de AccessDenied.jsx (web).
export default function AccessDeniedScreen() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigation = useNavigation()

  return (
    <AuthLayout>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-lg bg-error-container dark:bg-error-container-night">
          <XCircleIcon width={32} height={32} className="text-error dark:text-error-night" />
        </View>
        <Text className="mt-5 text-2xl font-bold text-on-surface dark:text-on-surface-night text-center">
          {t('login.accessDenied')}
        </Text>
        <Text className="mt-3 text-on-surface-variant dark:text-on-surface-variant-night text-center leading-relaxed">
          {t('accessDenied.text')}
        </Text>

        <View className="mt-5 w-full">
          <InfoCallout icon={<InfoIcon width={20} height={20} />}>
            {t('accessDenied.callout')}
          </InfoCallout>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Register')}
          className="mt-6 w-full rounded bg-primary dark:bg-primary-night py-3"
        >
          <Text className="text-center font-semibold text-on-primary dark:text-on-primary-night">
            {t('accessDenied.retry')}
          </Text>
        </Pressable>
        <Pressable onPress={logout} className="mt-4">
          <Text className="text-sm font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
            {t('nav.logout')}
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  )
}
