import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import OnlineIndicator from '../components/OnlineIndicator'
import { useAuth } from '../context/AuthContext'
import { getAccount, updateAccountStatus, updateAccountRole, deactivateAccount, reactivateAccount } from '../services/accounts'
import { formatDate } from '../utils/format'
import { ArrowLeftIcon, CheckIcon, XIcon, BookOpenIcon, DownloadIcon, ShieldCheckIcon } from '../components/icons'

const roles = ['student', 'teacher', 'admin']

// Portage de UserDetail.jsx (web).
export default function UserDetailScreen() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const { params } = useRoute()
  const { id } = params
  const { user: currentUser } = useAuth()
  const navigation = useNavigation()
  const [account, setAccount] = useState(null)
  const [counts, setCounts] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [role, setRole] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  function load() {
    getAccount(id)
      .then((res) => {
        setAccount(res.data.account)
        setRole(res.data.account.role)
        setCounts({ documents: res.data.deposited_documents_count, downloads: res.data.downloads_count })
      })
      .catch(() => setNotFound(true))
  }

  useEffect(load, [id])

  async function decide(status) {
    setBusy('status')
    setError('')
    try {
      await updateAccountStatus(id, status)
      load()
    } catch {
      setError(t('userDetail.genericError'))
    } finally {
      setBusy('')
    }
  }

  async function handleRoleUpdate() {
    setBusy('role')
    setError('')
    try {
      await updateAccountRole(id, role)
      load()
    } catch {
      setError(t('userDetail.genericError'))
    } finally {
      setBusy('')
    }
  }

  async function toggleActive() {
    setBusy('active')
    setError('')
    try {
      if (account.is_active) await deactivateAccount(id)
      else await reactivateAccount(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || t('userDetail.genericError'))
    } finally {
      setBusy('')
    }
  }

  const isSelf = account && currentUser.id === account.id

  return (
    <AppShell title={t('userDetail.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Pressable onPress={() => navigation.navigate('Users')} className="flex-row items-center gap-2 self-start">
          <ArrowLeftIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
          <Text className="text-sm font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
            {t('userDetail.backToList')}
          </Text>
        </Pressable>

        {notFound ? (
          <Text className="text-on-surface-variant dark:text-on-surface-variant-night">{t('userDetail.notFound')}</Text>
        ) : null}

        {account ? (
          <View className="gap-5">
            <View className="flex-row flex-wrap items-center gap-3">
              <Avatar user={account} size="md" />
              <Text className="text-2xl font-bold text-primary dark:text-primary-night">
                {account.first_name} {account.last_name}
              </Text>
              <StatusBadge status={account.account_status} />
              {!account.is_active ? <StatusBadge status="deactivated" /> : null}
              <OnlineIndicator online={account.is_online} />
            </View>

            <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 gap-4">
              <Field label={t('login.registrationNumber')} value={account.registration_number} />
              <Field label={t('userDetail.primaryEmail')} value={account.email} />
              <Field label={t('userDetail.secondaryEmail')} value={account.secondary_email ?? '—'} />
              <Field label={t('userDetail.role')} value={roleLabels[account.role]} />
              <Field label={t('deposit.program')} value={account.program ?? '—'} />
              <Field label={t('userDetail.registeredOn')} value={formatDate(account.created_at)} />
            </View>

            {counts ? (
              <View className="flex-row gap-4">
                <View className="flex-1 rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-5 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night">
                    <BookOpenIcon width={20} height={20} className="text-primary dark:text-primary-night" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-on-surface dark:text-on-surface-night">{counts.documents}</Text>
                    <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">{t('userDetail.depositedDocuments')}</Text>
                  </View>
                </View>
                <View className="flex-1 rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-5 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night">
                    <DownloadIcon width={20} height={20} className="text-primary dark:text-primary-night" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-on-surface dark:text-on-surface-night">{counts.downloads}</Text>
                    <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">{t('userDetail.downloads')}</Text>
                  </View>
                </View>
              </View>
            ) : null}

            {error ? <Text className="text-sm text-error dark:text-error-night">{error}</Text> : null}

            <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 gap-5">
              <View className="flex-row items-center gap-2">
                <ShieldCheckIcon width={20} height={20} className="text-on-surface dark:text-on-surface-night" />
                <Text className="font-semibold text-on-surface dark:text-on-surface-night">{t('userDetail.adminActions')}</Text>
              </View>

              {account.account_status === 'pending' ? (
                <View className="flex-row flex-wrap gap-3">
                  <Pressable
                    disabled={busy === 'status'}
                    onPress={() => decide('rejected')}
                    className="flex-row items-center gap-1.5 rounded border border-error dark:border-error-night px-4 py-2 disabled:opacity-60"
                  >
                    <XIcon width={16} height={16} className="text-error dark:text-error-night" />
                    <Text className="text-sm font-semibold text-error dark:text-error-night">{t('pendingAccounts.reject')}</Text>
                  </Pressable>
                  <Pressable
                    disabled={busy === 'status'}
                    onPress={() => decide('validated')}
                    className="flex-row items-center gap-1.5 rounded bg-primary dark:bg-primary-night px-4 py-2 disabled:opacity-60"
                  >
                    <CheckIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
                    <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">{t('pendingAccounts.validate')}</Text>
                  </Pressable>
                </View>
              ) : null}

              <View>
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-2">
                  {t('userDetail.changeRole')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {roles.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      className={`rounded-full px-4 py-1.5 ${
                        role === r ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          role === r ? 'text-on-primary dark:text-on-primary-night' : 'text-on-surface-variant dark:text-on-surface-variant-night'
                        }`}
                      >
                        {roleLabels[r]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  disabled={busy === 'role' || role === account.role}
                  onPress={handleRoleUpdate}
                  className="mt-3 self-start rounded border border-outline dark:border-outline-night px-4 py-2 disabled:opacity-60"
                >
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                    {t('userDetail.updateRole')}
                  </Text>
                </Pressable>
              </View>

              <View>
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-2">
                  {t('userDetail.accountActivation')}
                </Text>
                {isSelf ? (
                  <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                    {t('userDetail.cannotDeactivateSelf')}
                  </Text>
                ) : (
                  <Pressable
                    disabled={busy === 'active'}
                    onPress={toggleActive}
                    className="self-start rounded border border-outline dark:border-outline-night px-4 py-2 disabled:opacity-60"
                  >
                    <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                      {account.is_active ? t('users.deactivate') : t('users.reactivate')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  )
}

function Field({ label, value }) {
  return (
    <View>
      <Text className="text-xs font-semibold uppercase text-on-surface-variant dark:text-on-surface-variant-night">
        {label}
      </Text>
      <Text className="mt-1 text-on-surface dark:text-on-surface-night">{value}</Text>
    </View>
  )
}
