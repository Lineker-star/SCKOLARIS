import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { getAnalytics } from '../services/adminStats'
import { AlertTriangleIcon, InfoIcon } from '../components/icons'

const SEGMENT_CLASSES = [
  'bg-primary dark:bg-primary-night',
  'bg-secondary dark:bg-secondary-night',
  'bg-tertiary dark:bg-tertiary-night',
  'bg-error dark:bg-error-night',
]

function num(value) {
  return Number(value) || 0
}

function Card({ title, subtitle, children }) {
  return (
    <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-4 gap-3">
      <View>
        <Text className="text-base font-bold text-on-surface dark:text-on-surface-night">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">{subtitle}</Text>
        )}
      </View>
      {children}
    </View>
  )
}

// Pas de vraie librairie de graphiques sur mobile (aucune n'était déjà une
// dépendance) — une rangée de barres proportionnelles en Views suffit pour
// une tendance récente, sans ajouter de poids à l'app. Les 30 derniers
// jours seulement (pas 90 comme sur web) : à la largeur d'un téléphone, 90
// barres deviendraient illisibles.
function MiniBarChart({ data, height = 70 }) {
  const recent = data.slice(-30)
  const max = Math.max(1, ...recent.map((d) => num(d.count)))

  return (
    <View className="flex-row items-end gap-0.5" style={{ height }}>
      {recent.map((d, i) => (
        <View
          key={d.date ?? i}
          className="flex-1 rounded-t bg-primary dark:bg-primary-night"
          style={{ height: Math.max(2, (num(d.count) / max) * height) }}
        />
      ))}
    </View>
  )
}

function SeriesCard({ title, data, unit, t }) {
  const total = data.reduce((sum, d) => sum + num(d.count), 0)
  const last30 = data.slice(-30).reduce((sum, d) => sum + num(d.count), 0)

  return (
    <Card title={title} subtitle={t('statistics.seriesSubtitle')}>
      <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
        {t('statistics.seriesTotal', { total, unit, last30 })}
      </Text>
      <MiniBarChart data={data} />
    </Card>
  )
}

function ProportionCard({ title, subtitle, data }) {
  const total = data.reduce((sum, d) => sum + num(d.count), 0) || 1

  return (
    <Card title={title} subtitle={subtitle}>
      <View className="flex-row h-4 rounded-full overflow-hidden bg-surface-container dark:bg-surface-container-night">
        {data.map((d, i) => (
          <View key={d.label} className={SEGMENT_CLASSES[i % SEGMENT_CLASSES.length]} style={{ flex: num(d.count) / total }} />
        ))}
      </View>
      <View className="gap-1.5">
        {data.map((d, i) => (
          <View key={d.label} className="flex-row items-center gap-2">
            <View className={`h-2.5 w-2.5 rounded-full ${SEGMENT_CLASSES[i % SEGMENT_CLASSES.length]}`} />
            <Text className="flex-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
              {d.label} — {d.count} ({d.percentage}%)
            </Text>
          </View>
        ))}
      </View>
    </Card>
  )
}

function DomainTable({ domains, t }) {
  return (
    <Card title={t('statistics.catalogByDomain')} subtitle={t('statistics.documentsPerSubdomain')}>
      {domains.map((domain) => (
        <View key={domain.domain} className="gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-on-surface dark:text-on-surface-night">{domain.domain}</Text>
            <Text className="font-bold text-on-surface dark:text-on-surface-night">{domain.total}</Text>
          </View>
          {domain.subdomains.map((subdomain) => (
            <View key={subdomain.name} className="flex-row items-center justify-between pl-3">
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{subdomain.name}</Text>
              <Text
                className={`text-sm ${subdomain.count === 0 ? 'text-on-surface-variant dark:text-on-surface-variant-night' : 'font-semibold text-on-surface dark:text-on-surface-night'}`}
              >
                {subdomain.count}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  )
}

function DepositorsCard({ depositors, t }) {
  return (
    <Card title={t('statistics.mostActiveTeachers')} subtitle={t('statistics.top10ByDeposits')}>
      {depositors.map((row, i) => (
        <View key={row.label} className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night" numberOfLines={1}>
            {i + 1}. {row.label}
          </Text>
          <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{row.count}</Text>
        </View>
      ))}
    </Card>
  )
}

// Portage de Statistics.jsx (web) — même contenu, mais graphiques en
// barres/View plutôt qu'en camembert (pas de librairie de graphique côté
// mobile), et le détail du catalogue reste une table comme sur web.
export default function StatisticsScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || t('statistics.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  return (
    <AppShell title={t('nav.statistics')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text className="text-on-surface-variant dark:text-on-surface-variant-night">
          {t('statistics.intro')}
        </Text>

        <Pressable
          onPress={() => navigation.navigate('StatisticsSummary')}
          className="self-start flex-row items-center gap-2 rounded border border-outline-variant dark:border-outline-variant-night px-4 py-2.5"
        >
          <InfoIcon width={18} height={18} className="text-primary dark:text-primary-night" />
          <Text className="text-sm font-semibold text-primary dark:text-primary-night">{t('statistics.seeConclusions')}</Text>
        </Pressable>

        {loading && <ActivityIndicator className="mt-6" />}

        {error ? (
          <View className="flex-row items-start gap-2 rounded-lg border border-error dark:border-error-night bg-error-container dark:bg-error-container-night px-4 py-3">
            <AlertTriangleIcon width={18} height={18} className="mt-0.5 text-on-error-container dark:text-on-error-container-night" />
            <Text className="flex-1 text-sm text-on-error-container dark:text-on-error-container-night">{error}</Text>
          </View>
        ) : null}

        {data && (
          <>
            <SeriesCard title={t('statistics.downloadsPerDay')} data={data.downloads_daily} unit={t('statistics.downloadsUnit')} t={t} />
            <ProportionCard title={t('statistics.onlineNow')} subtitle={t('statistics.snapshot')} data={data.online_now} />
            <SeriesCard title={t('statistics.activeUsersPerDay')} data={data.activity_daily} unit={t('statistics.activeUsersUnit')} t={t} />
            <SeriesCard title={t('statistics.readsPerDay')} data={data.reads_daily} unit={t('statistics.readsUnit')} t={t} />
            <SeriesCard title={t('statistics.newRegistrationsPerDay')} data={data.registrations_daily} unit={t('statistics.registrationsUnit')} t={t} />
            <ProportionCard title={t('statistics.accountBreakdown')} subtitle={t('statistics.byStatus')} data={data.accounts_by_status} />
            <DomainTable domains={data.documents_by_domain} t={t} />
            <DepositorsCard depositors={data.top_depositors} t={t} />
          </>
        )}
      </ScrollView>
    </AppShell>
  )
}
