import { useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { getPendingAccounts, updateAccountStatus } from '../services/accounts'
import { formatDate } from '../utils/format'
import { CheckIcon, XIcon, ChevronRightIcon, ArrowLeftIcon } from '../components/icons'

// Portage de PendingAccounts.jsx (web) — liste des comptes à valider par
// l'admin (à ne pas confondre avec PendingAccountScreen, l'écran affiché à
// l'utilisateur dont le PROPRE compte est en attente).
export default function PendingAccountsScreen() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const [results, setResults] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    getPendingAccounts({ page })
      .then((res) => setResults(res.data))
      .catch(() => setError(t('pendingAccounts.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const accounts = results?.data ?? []

  async function decide(id, status) {
    setBusyId(id)
    try {
      await updateAccountStatus(id, status)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell title={t('nav.pendingAccounts')}>
      <FlatList
        data={accounts}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4 gap-3">
            <View>
              <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.pendingAccounts')}</Text>
              <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
                {t('pendingAccounts.intro')}
              </Text>
            </View>
            {error ? (
              <Text className="rounded bg-error-container dark:bg-error-container-night px-4 py-3 text-sm text-on-error-container dark:text-on-error-container-night">
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('pendingAccounts.empty')}
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-px bg-outline-variant dark:bg-outline-variant-night" />}
        renderItem={({ item: account }) => (
          <View className="flex-row items-center justify-between gap-3 py-4">
            <View className="flex-1">
              <Text className="font-semibold text-on-surface dark:text-on-surface-night">
                {account.first_name} {account.last_name}
              </Text>
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {account.registration_number} · {roleLabels[account.role]}
                {account.program ? ` · ${account.program}` : ''}
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-0.5">
                {t('pendingAccounts.registeredOn', { date: formatDate(account.created_at) })}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                disabled={busyId === account.id}
                onPress={() => decide(account.id, 'rejected')}
                className="rounded border border-error dark:border-error-night px-3 py-2 disabled:opacity-60"
              >
                <XIcon width={16} height={16} className="text-error dark:text-error-night" />
              </Pressable>
              <Pressable
                disabled={busyId === account.id}
                onPress={() => decide(account.id, 'validated')}
                className="rounded bg-primary dark:bg-primary-night px-3 py-2 disabled:opacity-60"
              >
                <CheckIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View>
            {loading ? <ActivityIndicator className="mt-6" /> : null}
            {!loading && results && results.last_page > 1 ? (
              <View className="mt-6 flex-row items-center justify-center gap-4">
                <Pressable
                  disabled={!results.prev_page_url}
                  onPress={() => setPage((p) => p - 1)}
                  className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-2 disabled:opacity-40"
                >
                  <ArrowLeftIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.previous')}</Text>
                </Pressable>
                <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('catalog.pageOf', { current: results.current_page, last: results.last_page })}
                </Text>
                <Pressable
                  disabled={!results.next_page_url}
                  onPress={() => setPage((p) => p + 1)}
                  className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-2 disabled:opacity-40"
                >
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.next')}</Text>
                  <ChevronRightIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                </Pressable>
              </View>
            ) : null}
          </View>
        }
      />
    </AppShell>
  )
}
