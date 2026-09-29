import { cloneElement, useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../../components/AppShell'
import { getStatistics } from '../../services/accounts'
import { getDeletionRequests } from '../../services/deletionRequests'
import { ShieldCheckIcon, TrashIcon, UsersIcon, BookOpenIcon, DownloadIcon, ChevronRightIcon, UploadCloudIcon } from '../../components/icons'

// Portage de AdminDashboard.jsx (web).
export default function AdminDashboardScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [pendingDeletions, setPendingDeletions] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Le nombre de comptes en attente vient de /statistics (un COUNT SQL),
    // pas d'un fetch de la liste entière juste pour en compter la longueur.
    getDeletionRequests().then((res) => setPendingDeletions(res.data.deletion_requests.length))
    getStatistics().then((res) => setStats(res.data))
  }, [])

  return (
    <AppShell title={t('dashboard.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">
            {t('adminDashboard.title')}
          </Text>
          <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('adminDashboard.intro')}
          </Text>
        </View>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6">
          <View className="flex-row items-center gap-2">
            <ShieldCheckIcon width={22} height={22} className="text-primary dark:text-primary-night" />
            <Text className="text-on-surface dark:text-on-surface-night font-semibold text-lg">
              {t('nav.pendingAccounts')}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
            {t('adminDashboard.pendingAccountsHint')}
          </Text>
          <Text className="mt-4 text-4xl font-bold text-primary dark:text-primary-night">
            {stats?.pending_accounts ?? '—'}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('PendingAccounts')}
            className="mt-4 self-start flex-row items-center gap-1 rounded bg-secondary-container dark:bg-secondary-container-night px-4 py-2"
          >
            <Text className="text-sm font-semibold text-on-secondary-container dark:text-on-secondary-container-night">
              {t('deletionRequests.review')}
            </Text>
            <ChevronRightIcon width={16} height={16} className="text-on-secondary-container dark:text-on-secondary-container-night" />
          </Pressable>
        </View>

        <View className="rounded-lg border border-error-container dark:border-error-container-night bg-error-container dark:bg-error-container-night p-6">
          <View className="flex-row items-center gap-2">
            <TrashIcon width={22} height={22} className="text-on-error-container dark:text-on-error-container-night" />
            <Text className="text-on-error-container dark:text-on-error-container-night font-semibold text-lg">
              {t('nav.deletionRequests')}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-on-error-container dark:text-on-error-container-night">
            {t('adminDashboard.deletionRequestsHint')}
          </Text>
          <Text className="mt-4 text-4xl font-bold text-on-error-container dark:text-on-error-container-night">
            {pendingDeletions ?? '—'}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('PendingDeletionRequests')}
            className="mt-4 self-start flex-row items-center gap-1 rounded bg-error dark:bg-error-night px-4 py-2"
          >
            <Text className="text-sm font-semibold text-on-error dark:text-on-error-night">{t('deletionRequests.review')}</Text>
            <ChevronRightIcon width={16} height={16} className="text-on-error dark:text-on-error-night" />
          </Pressable>
        </View>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6">
          <View className="flex-row items-center gap-2">
            <UploadCloudIcon width={22} height={22} className="text-primary dark:text-primary-night" />
            <Text className="text-on-surface dark:text-on-surface-night font-semibold text-lg">
              {t('nav.myDeposits')}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
            {t('adminDashboard.myDepositsHint')}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('DepositCourse')}
            className="mt-4 self-start flex-row items-center gap-1 rounded bg-secondary-container dark:bg-secondary-container-night px-4 py-2"
          >
            <Text className="text-sm font-semibold text-on-secondary-container dark:text-on-secondary-container-night">
              {t('adminDashboard.deposit')}
            </Text>
            <ChevronRightIcon width={16} height={16} className="text-on-secondary-container dark:text-on-secondary-container-night" />
          </Pressable>
        </View>

        <View className="gap-4">
          <StatTile icon={<UsersIcon />} label={t('nav.users')} value={stats?.total_users} />
          <StatTile icon={<ShieldCheckIcon />} label={t('adminDashboard.validatedAccounts')} value={stats?.validated_accounts} />
          <StatTile icon={<BookOpenIcon />} label={t('adminDashboard.catalogDocuments')} value={stats?.total_documents} />
          <StatTile icon={<DownloadIcon />} label={t('userDetail.downloads')} value={stats?.total_downloads} />
        </View>
      </ScrollView>
    </AppShell>
  )
}

function StatTile({ icon, label, value }) {
  return (
    <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night">
        {cloneElement(icon, { width: 20, height: 20, className: 'text-primary dark:text-primary-night' })}
      </View>
      <Text className="mt-4 text-3xl font-bold text-on-surface dark:text-on-surface-night">{value ?? '—'}</Text>
      <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{label}</Text>
    </View>
  )
}
