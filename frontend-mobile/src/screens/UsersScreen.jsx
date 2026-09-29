import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import OnlineIndicator from '../components/OnlineIndicator'
import { useAuth } from '../context/AuthContext'
import { getAccounts, updateAccountStatus, deactivateAccount, reactivateAccount } from '../services/accounts'
import { CheckIcon, XIcon, ChevronRightIcon, ArrowLeftIcon, SearchIcon } from '../components/icons'

// Portage de Users.jsx (web).
export default function UsersScreen() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const navigation = useNavigation()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [onlineFilter, setOnlineFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const statusFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'pending', label: t('status.pending') },
    { value: 'validated', label: t('users.filterValidated') },
    { value: 'rejected', label: t('users.filterRejected') },
  ]
  const onlineFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'online', label: t('status.online') },
    { value: 'offline', label: t('status.offline') },
  ]
  const roleFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'student', label: t('roles.student') },
    { value: 'teacher', label: t('roles.teacher') },
    { value: 'admin', label: t('roles.admin') },
  ]
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }

  function load() {
    setLoading(true)
    setError('')
    getAccounts({
      account_status: filter !== 'all' ? filter : undefined,
      is_online: onlineFilter !== 'all' ? (onlineFilter === 'online' ? 1 : 0) : undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      search: appliedSearch || undefined,
      page,
    })
      .then((res) => setResults(res.data))
      .catch(() => setError(t('users.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter, onlineFilter, roleFilter, appliedSearch, page])

  function changeStatusFilter(value) {
    setPage(1)
    setFilter(value)
  }

  function changeOnlineFilter(value) {
    setPage(1)
    setOnlineFilter(value)
  }

  function changeRoleFilter(value) {
    setPage(1)
    setRoleFilter(value)
  }

  function handleSearch() {
    setPage(1)
    setAppliedSearch(search)
  }

  async function decide(id, status) {
    setBusyId(id)
    try {
      await updateAccountStatus(id, status)
      load()
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(account) {
    setBusyId(account.id)
    try {
      if (account.is_active) await deactivateAccount(account.id)
      else await reactivateAccount(account.id)
      load()
    } finally {
      setBusyId(null)
    }
  }

  const visible = results?.data ?? []

  return (
    <AppShell title={t('nav.users')}>
      <FlatList
        data={visible}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View>
              <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.users')}</Text>
              <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
                {t('users.intro')}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <View className="relative flex-1">
                <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                  <SearchIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                </View>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearch}
                  placeholder={t('users.searchPlaceholder')}
                  placeholderTextColor="#8a90a0"
                  className="rounded border border-outline dark:border-outline-night bg-surface-container-lowest dark:bg-surface-container-lowest-night py-3 pl-10 pr-3 text-on-surface dark:text-on-surface-night"
                />
              </View>
              <Pressable onPress={handleSearch} className="rounded bg-primary dark:bg-primary-night px-5 items-center justify-center">
                <Text className="font-semibold text-on-primary dark:text-on-primary-night">{t('common.search')}</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {roleFilters.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => changeRoleFilter(value)}
                  className={`rounded-full px-4 py-1.5 ${
                    roleFilter === value
                      ? 'bg-primary dark:bg-primary-night'
                      : 'bg-surface-container dark:bg-surface-container-night'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      roleFilter === value
                        ? 'text-on-primary dark:text-on-primary-night'
                        : 'text-on-surface-variant dark:text-on-surface-variant-night'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {statusFilters.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => changeStatusFilter(value)}
                  className={`rounded-full px-4 py-1.5 ${
                    filter === value
                      ? 'bg-primary dark:bg-primary-night'
                      : 'bg-surface-container dark:bg-surface-container-night'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      filter === value
                        ? 'text-on-primary dark:text-on-primary-night'
                        : 'text-on-surface-variant dark:text-on-surface-variant-night'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {onlineFilters.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => changeOnlineFilter(value)}
                  className={`rounded-full px-4 py-1.5 ${
                    onlineFilter === value
                      ? 'bg-secondary-container dark:bg-secondary-container-night'
                      : 'bg-surface-container dark:bg-surface-container-night'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      onlineFilter === value
                        ? 'text-on-secondary-container dark:text-on-secondary-container-night'
                        : 'text-on-surface-variant dark:text-on-surface-variant-night'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!loading && results ? (
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {t('users.resultCount', { count: results.total })}
              </Text>
            ) : null}
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
              {t('users.noneForFilter')}
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-px bg-outline-variant dark:bg-outline-variant-night" />}
        renderItem={({ item: account }) => (
          <Pressable
            onPress={() => navigation.navigate('UserDetail', { id: account.id })}
            className="flex-row items-center justify-between gap-3 py-4"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar user={account} />
              <View className="flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="font-semibold text-on-surface dark:text-on-surface-night">
                    {account.first_name} {account.last_name}
                  </Text>
                  <StatusBadge status={account.account_status} />
                  {!account.is_active ? <StatusBadge status="deactivated" /> : null}
                </View>
                <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                  {account.registration_number} · {roleLabels[account.role]}
                  {account.program ? ` · ${account.program}` : ''}
                </Text>
                <OnlineIndicator online={account.is_online} className="mt-1" />
              </View>
            </View>

            <View className="gap-2">
              {account.account_status === 'pending' ? (
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
              ) : account.id !== currentUser.id ? (
                <Pressable
                  disabled={busyId === account.id}
                  onPress={() => toggleActive(account)}
                  className="rounded border border-outline dark:border-outline-night px-3 py-2 disabled:opacity-60"
                >
                  <Text className="text-xs font-semibold text-on-surface dark:text-on-surface-night">
                    {account.is_active ? t('users.deactivate') : t('users.reactivate')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
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
