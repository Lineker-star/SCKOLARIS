import { useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { getDeletionRequests } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { CheckIcon } from '../components/icons'

// Portage de PendingDeletionRequests.jsx (web).
export default function PendingDeletionRequestsScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeletionRequests()
      .then((res) => setRequests(res.data.deletion_requests))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell title={t('nav.deletionRequests')}>
      <FlatList
        data={requests}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.deletionRequests')}</Text>
            <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
              {t('deletionRequests.intro')}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('deletionRequests.empty')}
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-px bg-outline-variant dark:bg-outline-variant-night" />}
        renderItem={({ item: r }) => (
          <View className="flex-row items-center justify-between gap-3 py-4">
            <View className="flex-1">
              <Text className="font-semibold text-on-surface dark:text-on-surface-night">{r.document?.title}</Text>
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {r.document?.depositor?.first_name} {r.document?.depositor?.last_name} · {r.document?.subdomain?.name}
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-0.5">
                {formatDate(r.requested_at)}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('DeletionRequestDetail', { id: r.id })}
              className="flex-row items-center gap-1.5 rounded bg-primary dark:bg-primary-night px-3 py-1.5"
            >
              <CheckIcon width={14} height={14} className="text-on-primary dark:text-on-primary-night" />
              <Text className="text-xs font-semibold text-on-primary dark:text-on-primary-night">{t('deletionRequests.review')}</Text>
            </Pressable>
          </View>
        )}
      />
    </AppShell>
  )
}
