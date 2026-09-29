import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../../components/AppShell'
import DocumentCard from '../../components/DocumentCard'
import { useAuth } from '../../context/AuthContext'
import { getDownloads } from '../../services/documents'
import { getCatalog } from '../../services/catalog'
import { SearchIcon } from '../../components/icons'
import { formatDate } from '../../utils/format'

// Portage de StudentDashboard.jsx (web).
export default function StudentDashboardScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [search, setSearch] = useState('')
  const [downloads, setDownloads] = useState([])
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      user.account_status === 'validated' ? getDownloads() : Promise.resolve({ data: { downloads: [] } }),
      getCatalog(),
    ])
      .then(([downloadsRes, catalogRes]) => {
        setDownloads(downloadsRes.data.downloads.slice(0, 2))
        setLatest((catalogRes.data.data ?? []).slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [user.account_status])

  function handleSearch() {
    navigation.navigate('Catalog', { search })
  }

  return (
    <AppShell title={t('dashboard.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 32 }}>
        <View className="flex-row gap-2">
          <View className="relative flex-1">
            <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
              <SearchIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              placeholder={t('studentDashboard.searchPlaceholder')}
              placeholderTextColor="#8a90a0"
              className="rounded border border-outline dark:border-outline-night bg-surface-container-lowest dark:bg-surface-container-lowest-night py-3 pl-10 pr-3 text-on-surface dark:text-on-surface-night"
            />
          </View>
          <Pressable onPress={handleSearch} className="rounded bg-primary dark:bg-primary-night px-5 items-center justify-center">
            <Text className="font-semibold text-on-primary dark:text-on-primary-night">{t('common.search')}</Text>
          </Pressable>
        </View>

        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-on-surface dark:text-on-surface-night">{t('nav.myLibrary')}</Text>
            <Pressable onPress={() => navigation.navigate('MyLibrary')}>
              <Text className="text-sm font-semibold text-primary dark:text-primary-night">{t('dashboard.seeAll')}</Text>
            </Pressable>
          </View>

          {!loading && user.account_status !== 'validated' ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('studentDashboard.downloadPending')}
            </Text>
          ) : null}
          {!loading && user.account_status === 'validated' && downloads.length === 0 ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('studentDashboard.noDownloads')}
            </Text>
          ) : null}
          <View className="gap-3">
            {downloads.map((d) => (
              <DocumentCard
                key={d.id}
                title={d.document?.title}
                author={d.document?.author}
                subject={d.document?.subdomain?.name}
                coverUrl={d.document?.cover_url}
                date={formatDate(d.downloaded_at)}
                onPress={() => navigation.navigate('DocumentDetail', { id: d.document?.id })}
              />
            ))}
          </View>
        </View>

        <View>
          <Text className="text-xl font-bold text-on-surface dark:text-on-surface-night mb-4">
            {t('dashboard.latestAdditions')}
          </Text>
          <View className="gap-3">
            {latest.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                author={doc.author}
                subject={doc.subdomain?.name}
                coverUrl={doc.cover_url}
                onPress={() => navigation.navigate('DocumentDetail', { id: doc.id })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  )
}
