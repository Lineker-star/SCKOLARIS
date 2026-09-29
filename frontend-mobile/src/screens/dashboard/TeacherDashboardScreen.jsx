import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../../components/AppShell'
import DocumentCard from '../../components/DocumentCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getMyUploads } from '../../services/documents'
import { getCatalog } from '../../services/catalog'
import { formatDate } from '../../utils/format'

// Portage de TeacherDashboard.jsx (web) — sans le menu de notifications
// (aucune notification réelle n'existe encore côté API).
export default function TeacherDashboardScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [uploads, setUploads] = useState([])
  const [latest, setLatest] = useState([])

  useEffect(() => {
    getMyUploads().then((res) => setUploads(res.data.documents.slice(0, 2)))
    getCatalog().then((res) => setLatest((res.data.data ?? []).slice(0, 3)))
  }, [])

  return (
    <AppShell title={t('dashboard.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 32 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">
            {t('dashboard.greeting', { name: user.first_name })}
          </Text>
          <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('teacherDashboard.welcome')}
          </Text>
        </View>

        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-on-surface dark:text-on-surface-night">{t('teacherDashboard.recentDeposits')}</Text>
            <Text
              onPress={() => navigation.navigate('MyDeposits')}
              className="text-sm font-semibold text-primary dark:text-primary-night"
            >
              {t('dashboard.seeAll')}
            </Text>
          </View>
          {uploads.length === 0 ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('myDeposits.empty')}
            </Text>
          ) : (
            <View className="gap-3">
              {uploads.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  author={doc.author}
                  subject={doc.subdomain?.name}
                  coverUrl={doc.cover_url}
                  date={formatDate(doc.uploaded_at)}
                  actions={
                    doc.deletion_requests?.some((r) => r.status === 'pending') ? (
                      <StatusBadge status="pending" />
                    ) : null
                  }
                  onPress={() => navigation.navigate('DocumentDetail', { id: doc.id })}
                />
              ))}
            </View>
          )}
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
