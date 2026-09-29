import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import InfoCallout from '../components/InfoCallout'
import { useAuth } from '../context/AuthContext'
import { HourglassIcon, InfoIcon } from '../components/icons'

// Portage de PendingAccount.jsx (web). Le routage conditionnel (rejected /
// validated) est géré par RootNavigator, qui ne monte cet écran que pour
// un compte réellement "pending" — pas besoin de le revérifier ici.
export default function PendingAccountScreen() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigation = useNavigation()

  return (
    <AuthLayout>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-lg bg-secondary-container dark:bg-secondary-container-night">
          <HourglassIcon width={32} height={32} className="text-secondary dark:text-secondary-night" />
        </View>
        <Text className="mt-5 text-2xl font-bold text-on-surface dark:text-on-surface-night text-center">
          {t('pendingAccount.title')}
        </Text>
        <Text className="mt-3 text-on-surface-variant dark:text-on-surface-variant-night text-center leading-relaxed">
          {t('pendingAccount.text')}
        </Text>

        <View className="mt-5 w-full">
          <InfoCallout icon={<InfoIcon width={20} height={20} />}>
            {t('pendingAccount.callout')}
          </InfoCallout>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Catalog')}
          className="mt-6 w-full rounded bg-primary dark:bg-primary-night py-3"
        >
          <Text className="text-center font-semibold text-on-primary dark:text-on-primary-night">
            {t('pendingAccount.goToCatalog')}
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
