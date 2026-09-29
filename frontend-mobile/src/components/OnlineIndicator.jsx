import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function OnlineIndicator({ online, className = '' }) {
  const { t } = useTranslation()
  return (
    <View className={`flex-row items-center gap-1.5 ${className}`}>
      <View className={`h-2 w-2 rounded-full ${online ? 'bg-success dark:bg-success-night' : 'bg-outline dark:bg-outline-night'}`} />
      <Text
        className={`text-xs font-medium ${
          online ? 'text-success dark:text-success-night' : 'text-on-surface-variant dark:text-on-surface-variant-night'
        }`}
      >
        {online ? t('status.online') : t('status.offline')}
      </Text>
    </View>
  )
}
