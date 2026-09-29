import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Pdf from 'react-native-pdf'
import { ArrowLeftIcon } from '../components/icons'

// Lecteur PDF interne — remplace l'ancien renvoi vers une app externe
// (expo-sharing) : le document téléchargé/lu s'affiche directement dans
// SCKOLARIS, comme demandé.
export default function DocumentReaderScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { params } = useRoute()
  const { uri, title } = params
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface dark:bg-surface-night">
      <View className="flex-row items-center gap-3 border-b border-outline-variant dark:border-outline-variant-night bg-surface dark:bg-surface-night px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('reader.backAria')}>
          <ArrowLeftIcon width={22} height={22} className="text-on-surface dark:text-on-surface-night" />
        </Pressable>
        <Text numberOfLines={1} className="flex-1 font-semibold text-on-surface dark:text-on-surface-night">
          {title ?? t('reader.documentFallback')}
        </Text>
      </View>

      <View className="flex-1">
        {error ? (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-error dark:text-error-night text-center">{error}</Text>
          </View>
        ) : (
          <Pdf
            source={{ uri, cache: true }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            onLoadComplete={() => setLoading(false)}
            onError={(err) => {
              console.error('[DocumentReader] échec de rendu PDF :', err)
              setLoading(false)
              setError(t('reader.loadError'))
            }}
          />
        )}
        {loading && !error ? (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}
